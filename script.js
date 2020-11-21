function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}

function updateLocalLibraryStorage(){
    if (storageAvailable("localStorage")){
        localStorage.setItem("myLibrary",JSON.stringify(myLibrary));
    }
}

function getLocalLibraryStorage(){
    if (storageAvailable("localStorage")){
        const newLibrary = JSON.parse(localStorage.getItem("myLibrary"));
        if (newLibrary === undefined) return [];
        return JSON.parse(localStorage.getItem("myLibrary"));
    }
}

let myLibrary = getLocalLibraryStorage();

function Book(title, author, pages, read){
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.read = read;
}

function addBookToLibrary(title, author, pages, read){
    myLibrary.push(new Book(title, author, pages, read));
    updateLocalLibraryStorage();
}

// function to look up table headers' class names
// and return an array with matching entries for that book
function getBookDetails(book){
    // stores each th element's classname to bookHeaders array
    const bookHeaders = Array.from(document.querySelectorAll("th")).map(header => header.className);
    const bookEntries = bookHeaders.map(header => book[header]);

    return {bookHeaders, bookEntries}
}

function toggleRead(){
    bookIndex = this.parentNode.parentNode.dataset.bookIndex;
    if (myLibrary[bookIndex].read === true) myLibrary[bookIndex].read = false;
    else myLibrary[bookIndex].read = true;
    updateLocalLibraryStorage();
    refreshTable();
}

function addTdBookElt(rowElt, header, entry){
    const newEntry = document.createElement("td");
    
    // for read, convert bool to Yes/No
    if (header === "read"){
        if (entry === true) entry = "Yes";
        else entry = "No";
    }


    newEntry.innerText = entry;
    newEntry.classList.add(header);

    // add edit icon to read
    if (header === "read"){
        const editIcon = document.createElement("img");
        editIcon.src = "images/edit_icon.png";
        editIcon.alt = "Edit";
        editIcon.classList = "edit-icon";
        editIcon.addEventListener("click", toggleRead)
        newEntry.appendChild(editIcon);
    }
    // append td to tr
    rowElt.appendChild(newEntry);
}

function refreshTable(){
    document.querySelector("#book-list").querySelectorAll("tr").forEach(rowElt => rowElt.id !== "row-headers" && rowElt.remove());
    displayAllBooksInTable();
}

function removeBook(){
    bookIndex = this.parentNode.parentNode.dataset.bookIndex;
    myLibrary.splice(bookIndex, 1);
    updateLocalLibraryStorage();
    refreshTable();
}

function addRemoveBtn(rowElt){
    removeBtn = document.createElement("button");
    removeBtn.classList = "no-btn";
    removeBtn.innerText = "Remove Book";
    removeBtn.addEventListener("click", removeBook);

    removeBtnTd = document.createElement("td");
    removeBtnTd.appendChild(removeBtn);

    rowElt.appendChild(removeBtnTd);
}

function makeTrBookElt(bookDetails, bookIndex){
    const newRowElt = document.createElement("tr");
    newRowElt.dataset.bookIndex = bookIndex;

    for (let bookIndex = 0; bookIndex < bookDetails.bookHeaders.length; bookIndex++){
        addTdBookElt(newRowElt, bookDetails.bookHeaders[bookIndex], bookDetails.bookEntries[bookIndex])
    }

    addRemoveBtn(newRowElt);

    document.querySelector("#book-list").appendChild(newRowElt);
}

function displayBookInTable(book, bookIndex){
    const bookDetails = getBookDetails(book);
    makeTrBookElt(bookDetails, bookIndex);
}

function displayEmptyMessage(){
    const newRowElt = document.createElement("tr");
    const newEntry = document.createElement("td");
    newEntry.innerText = "There are no books in the library!";
    newEntry.colSpan = Array.from(document.querySelectorAll("th")).map(header => header.className).length;
    newRowElt.appendChild(newEntry);
    document.querySelector("#book-list").appendChild(newRowElt);
}

function displayAllBooksInTable(){
    if (myLibrary.length === 0) displayEmptyMessage();
    else myLibrary.forEach(displayBookInTable);
}


function hideBookFormAndShowAddNewBookBtn(){
    document.querySelector("#new-book-form").style.display = "none";
    document.querySelector("#new-book-btn").style.display = "block";
}

function hideAddNewBookBtnAndShowBookForm(){
    document.querySelector("#new-book-btn").style.display = "none";
    document.querySelector("#new-book-form").style.display = "block";
}

function addBookFromForm(e){
    // get form values
    const title = document.querySelector("#title").value;
    const author = document.querySelector("#author").value;
    const pages = document.querySelector("#pages").value;
    const read = document.querySelector("#read-yes").checked ? true : false;

    document.querySelector("#new-book-form").reset();

    addBookToLibrary(title, author, pages, read);
    refreshTable();
}

function handleForm(event) { 
    event.preventDefault(); 
}

document.querySelector("#new-book-form").style.display = "none";

displayAllBooksInTable();

document.querySelector("#new-book-form").addEventListener("submit",addBookFromForm)
document.querySelector("#new-book-form").addEventListener('submit', handleForm);
document.querySelector("#cancel-new-book").addEventListener('click', hideBookFormAndShowAddNewBookBtn);
document.querySelector("#new-book-btn").addEventListener('click', hideAddNewBookBtnAndShowBookForm);