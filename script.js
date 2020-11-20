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

function displayAllBooksInTable(){
    myLibrary.forEach(displayBookInTable);
}

displayAllBooksInTable(myLibrary);