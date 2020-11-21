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
        if (newLibrary === null) return [];
        return JSON.parse(localStorage.getItem("myLibrary"));
    }
    return [];
}

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
    bookIndex = this.parentNode.parentNode.parentNode.parentNode.dataset.bookIndex;
    if (myLibrary[bookIndex].read === true) myLibrary[bookIndex].read = false;
    else myLibrary[bookIndex].read = true;
    updateLocalLibraryStorage();
    refreshTable();
}

function addTdBookElt(rowElt, header, entry){
    const newEntry = document.createElement("td");
    const tdDiv = document.createElement("div");
    
    // read special case
    // convert bool to Yes/No
    // add in div containers - one for text, one for image
    if (header === "read"){
        if (entry === true) entry = "Yes";
        else entry = "No";
    }

    // put td's in div container first
    const newDiv = document.createElement("div");
    newDiv.innerText = entry;
    tdDiv.classList = "table-entry";
    tdDiv.appendChild(newDiv);
    

    // add edit icon to read
    if (header === "read"){
        const editDiv = document.createElement("div");
        const editIcon = document.createElement("img");
        editIcon.src = "images/edit_icon.png";
        editIcon.alt = "Edit";
        editIcon.classList = "edit-icon";
        editIcon.addEventListener("click", toggleRead)
        editDiv.appendChild(editIcon);
        tdDiv.appendChild(editDiv);
    }


    newEntry.classList.add(header);
    newEntry.appendChild(tdDiv);
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
    removeBtnTd.classList = "off-table";
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
    const newEntry = document.createElement("p");
    newEntry.innerText = `There are no books in the library! Please add some books by clicking the button above`;
    document.querySelector(".library-container").appendChild(newEntry);
}

function displayAllBooksInTable(){
    if (myLibrary.length === 0) {
        document.querySelector("#book-list").style.display = "none";
        displayEmptyMessage();
    }
    else{
        const pTag = document.querySelector(".library-container").querySelector("p");
        if (pTag !== null) pTag.remove();
        document.querySelector("#book-list").style.display = "block";
        myLibrary.forEach(displayBookInTable);
    }
}

function hideBookForm(){
    document.querySelector("#overlay").style.display = "none";
}

function showBookForm(){
    document.querySelector("#overlay").style.display = "flex";
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

let myLibrary = getLocalLibraryStorage();
displayAllBooksInTable();

document.querySelector("#new-book-form").addEventListener("submit",addBookFromForm)
document.querySelector("#new-book-form").addEventListener('submit', handleForm);
document.querySelector("#cancel-new-book").addEventListener('click', hideBookForm);
document.querySelector("#new-book-btn").addEventListener('click', showBookForm);