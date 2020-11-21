let myLibrary = [];

function Book(title, author, pages, read){
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.read = read;
}

function addBookToLibrary(title, author, pages, read){
    // add book to library
    myLibrary.push(new Book(title, author, pages, read));
}

// function to look up table headers' class names
// and return an array with matching entries for that book
function getBookDetails(book){
    // stores each th element's classname to bookHeaders array
    const bookHeaders = Array.from(document.querySelectorAll("th")).map(header => header.className);
    const bookEntries = bookHeaders.map(header => book[header]);

    return {bookHeaders, bookEntries}
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
    refreshTable();
}

function addRemoveBtn(rowElt){
    removeBtn = document.createElement("button");
    removeBtn.classList = "no-btn";
    removeBtn.innerText = "x";
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

    addBookToLibrary(title, author, pages, read)
    refreshTable();
}

function handleForm(event) { 
    event.preventDefault(); 
}

document.querySelector("#new-book-form").style.display = "none";

addBookToLibrary("The Hobbit", "Tolkien", 255, true);
addBookToLibrary("Musashi", "Eiji Yoshikawa", 1000, true);
addBookToLibrary("Lord of the Flies", "William Golding", 200, false);

displayAllBooksInTable();

document.querySelector("#new-book-form").addEventListener("submit",addBookFromForm)
document.querySelector("#new-book-form").addEventListener('submit', handleForm);
document.querySelector("#cancel-new-book").addEventListener('click', hideBookFormAndShowAddNewBookBtn);
document.querySelector("#new-book-btn").addEventListener('click', hideAddNewBookBtnAndShowBookForm);