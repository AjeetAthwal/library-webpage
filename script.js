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

function printBook(book){
    // get details of index-th book
    const title = book.title;
    const author = book.author;
    const pages = book.pages;
    const read = book.read;

    // convert read into "Yes" or "No"
    let readForTable = "";
    if (read === true) readForTable += "Yes";
    else readForTable += "No";

    // add these to a td element each
    const titleEntry = document.createElement("td");
    titleEntry.innerText = title;
    const authorEntry = document.createElement("td");
    authorEntry.innerText = author;
    const pagesEntry = document.createElement("td");
    pagesEntry.innerText = pages;
    const readEntry = document.createElement("td");
    readEntry.innerText = readForTable;

    // make tr element and append tds to it
    const newRow = document.createElement("tr");
    newRow.appendChild(titleEntry);
    newRow.appendChild(authorEntry);
    newRow.appendChild(pagesEntry);
    newRow.appendChild(readEntry);

    // add new row to table
    document.querySelector("#book-list").appendChild(newRow);
}

function printBooks(){
    myLibrary.forEach(printBook);
}

printBooks();