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

addBookToLibrary("The Hobbit", "Tolkien", 255, true);
addBookToLibrary("Musashi", "Eiji Yoshikawa", 1000, true);
addBookToLibrary("Lord of the Flies", "William Golding", 200, false);

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

function makeTrBookElt(bookDetails){
    const newRowElt = document.createElement("tr");

    for (let bookIndex = 0; bookIndex < bookDetails.bookHeaders.length; bookIndex++){
        addTdBookElt(newRowElt, bookDetails.bookHeaders[bookIndex], bookDetails.bookEntries[bookIndex])
    }

    // add a remove button for each row

    document.querySelector("#book-list").appendChild(newRowElt);
}

function displayBookInTable(book){
    const bookDetails = getBookDetails(book);
    makeTrBookElt(bookDetails);
}

function displayEmptyMessage(){
    const newRowElt = document.createElement("tr");
    const newEntry = document.createElement("td");
    newEntry.innerText = "There are no books in the library!";
    newEntry.colSpan = Array.from(document.querySelectorAll("th")).map(header => header.className).length;
    // add a remove button for each row
    newRowElt.appendChild(newEntry);
    document.querySelector("#book-list").appendChild(newRowElt);
}

function displayAllBooksInTable(){
    if (myLibrary.length === 0) displayEmptyMessage();
    else myLibrary.forEach(displayBookInTable);
}

function clearDisplayTable(){
    document.querySelector("#book-list").querySelectorAll("tr").forEach(rowElt => rowElt.id !== "row-headers" && rowElt.remove());
}

function createAddNewBookBtn(){
    const newBookBtn = document.createElement("button");
    newBookBtn.id = "new-book-btn";
    newBookBtn.innerText = "Add New Book";
    document.querySelector(".new-book").appendChild(newBookBtn);
}

function removeAddNewBookBtn(){
    document.querySelector("#new-book-btn").remove();
}

function createBookForm(){
    // remove add new book button

    // put form in new-book div container
}

createAddNewBookBtn();
displayAllBooksInTable(myLibrary);