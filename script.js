let myLibrary = [];

function Book(title, author, pages, read){
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.read = read;
}

function addBookToLibrary(title, author, pages, read){
    // // prompt user input and store
    // let title = prompt("Name of book:");
    // let author = prompt("Name of author:");
    // let pages_inp = prompt("Number of pages:");
    // let read_yn = prompt("Read? y/n:");

    // // process pages into a number
    // let pages = parseInt(pages_inp);

    // // process read into a bool
    // let read = false;
    // if (read_yn.charAt(0).toUpperCase() === "Y") read = true;

    // add book to library
    myLibrary.push(new Book(title, author, pages, read));
}

addBookToLibrary("The Hobbit", "Tolkien", 255, true);
addBookToLibrary("Musashi", "Eiji Yoshikawa", 1000, true);
addBookToLibrary("Lord of the Flies", "William Golding", 200, false);

// function to look up table headers' class names
// and return an array with matching entries for that book
function getBookEntries(book){
    // stores each th element's classname to bookHeaders array
    const bookHeaders = Array.from(document.querySelectorAll("th")).map(header => header.className);
    const bookEntries = bookHeaders.map(header => book[header]);

    return {bookHeaders, bookEntries}
}

function addTdBookElt(rowElt, header, entry){
    const newEntry = document.createElement("td");

    if (header === "read"){
        if (entry === true) entry = "Yes";
        else entry = "No";
    }

    newEntry.innerText = entry;
    newEntry.classList.add(header);
    rowElt.appendChild(newEntry);
}

function makeTrBookElt(bookList){
    const newRowElt = document.createElement("tr");

    for (let bookIndex = 0; bookIndex < bookList.bookHeaders.length; bookIndex++){
        addTdBookElt(newRowElt, bookList.bookHeaders[bookIndex], bookList.bookEntries[bookIndex])
    }

    document.querySelector("#book-list").appendChild(newRowElt);
}

function displayBookInTable(book){
    const bookList = getBookEntries(book);
    makeTrBookElt(bookList);
}

function displayAllBooksInTable(){
    myLibrary.forEach(displayBookInTable);
}

displayAllBooksInTable(myLibrary);