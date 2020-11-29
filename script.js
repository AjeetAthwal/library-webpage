const LibraryStorage = (() => {
    class LibraryStorage{
        constructor(){
            this._serverStorageWanted =  false;
            this._localStorageWanted = true;
        }

        _storageAvailable(type) {
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

        _updateLocalStorage(){
            if (this._storageAvailable("localStorage")){
                localStorage.setItem("myLibrary",JSON.stringify(Library.myLibrary));
            }
        }

        _updateServerStorage(){
            //
            return;
        }

        _getLocalStorage(){
            if (this._storageAvailable("localStorage")){
                const newLibrary = JSON.parse(localStorage.getItem("myLibrary"));
                if (newLibrary === null) return [];
                return newLibrary;
            }
            return [];
        }

        _getServerStorage(){
            //
            return;
        }

        updateStorage(){
            if (this._serverStorageWanted) this._updateServerStorage();
            else if (this._localStorageWanted) this._updateLocalStorage();
        }

        getStorage(){
            if (this._serverStorageWanted) return this._getServerStorage();
            else if (this._localStorageWanted) {
                return this._getLocalStorage();}
        }
    }

    const storage = new LibraryStorage();

    return {storage}
})();

const Library = (() => {
    class Book{
        // not using # for now - new and experimental
        constructor(title, author, pages, read){
            this._title = title;
            this._author = author;
            this._pages = pages;
            this._read = read;        
        }

        get title(){
            return this._title;
        }

        set title(newTitle){
            if (typeof newTitle !== "string") throw new Error("Title must be a string");
            if (newTitle === "") throw new Error("Title must not be empty");
            this._title = newTitle;
            
        }

        get author(){
            return this._author;
        }

        set author(newAuthor){
            if (typeof newAuthor !== "string") throw new Error("Author must be a string");
            if (newAuthor === "") throw new Error("Author must not be empty");
            this._author = newAuthor;
        }

        get pages(){
            return this._pages;
        }

        set pages(newPages){
            if (typeof newPages !== "number") throw new Error("Pages must be an integer");
            this._pages = newPages;
        }

        get read(){
            return this._read;
        }

        set read(hasRead){
            if (typeof hasRead !== "boolean") throw new Error("Read must be a boolean");
            this._read = hasRead;
        }

        toggleRead() {
            if (this.read === true) this.read = false;
            else this.read = true;
        }

        getTableEntry(header) {
            if (header === "read") {
                return this.read === true ? "Yes" : "No";
            }
            if (header === "pages") return this.pages;
            if (header === "author") return this.author;
            if (header === "title") return this.title;
        }

        toJSON() {
            return{
                title: this.title,
                author: this.author,
                pages: this.pages,
                read: this.read,
            }
        }
    }

    class Library{
        // not using # for now - new and experimental
        constructor(library){
            if (Array.isArray(library["library"])){
                if (library["library"] === []) this._library = library["library"];
                else {
                    this._library = library["library"].map(book => new Book(book.title, book.author, book.pages, book.read));
                }
            }
            else this._library = [];

        }

        addBookToLibrary(title, author, pages, read){
            this._library.push(new Book(title, author, pages, read));
        }

        removeBookFromLibrary(bookIndex){
            let book = this.library.splice(bookIndex, 1);
            return book;
        }

        get isEmpty(){
            return this.library.length === 0 ? true : false;
        }

        get library(){
            return this._library;
        }

        getBookNumber(bookIndex){
            return this._library[bookIndex];
        }

        toggleRead(bookIndex){
            this._library[bookIndex].toggleRead();
        }

        getTableEntry(bookIndex, header){
            this._library[bookIndex].getTableEntry(header);
        }

        toJSON() {
            return{
                library: this.library
            }
        }
    }

    // Library
    const myLibrary = new Library(LibraryStorage.storage.getStorage());

    return {myLibrary}

})();

// DOM
// function to look up table headers' class names
// and return an array with matching entries for that book
function getBookDetails(book){
    // stores each th element's classname to bookHeaders array
    const bookHeaders = Array.from(document.querySelectorAll("th")).map(header => header.className);
    const bookEntries = bookHeaders.map(header => book[header]);

    return {bookHeaders, bookEntries}
}

// DOM
function toggleRead(){
    bookIndex = this.parentNode.parentNode.parentNode.parentNode.dataset.bookIndex;
    Library.myLibrary.toggleRead(bookIndex);
    LibraryStorage.storage.updateStorage();
    refreshTable();
}

// DOM
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

// DOM
function refreshTable(){
    document.querySelector("#book-list").querySelectorAll("tr").forEach(rowElt => rowElt.id !== "row-headers" && rowElt.remove());
    displayAllBooksInTable();
}

// Dom/Library
function removeBook(){
    bookIndex = this.parentNode.parentNode.dataset.bookIndex;
    Library.myLibrary.removeBookFromLibrary(bookIndex);
    LibraryStorage.storage.updateStorage();
    refreshTable();
}

// DOM
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

// DOM
function makeTrBookElt(bookDetails, bookIndex){
    const newRowElt = document.createElement("tr");
    newRowElt.dataset.bookIndex = bookIndex;

    for (let bookIndex = 0; bookIndex < bookDetails.bookHeaders.length; bookIndex++){
        addTdBookElt(newRowElt, bookDetails.bookHeaders[bookIndex], bookDetails.bookEntries[bookIndex])
    }

    addRemoveBtn(newRowElt);

    document.querySelector("#book-list").appendChild(newRowElt);
}

// DOM
function displayBookInTable(book, bookIndex){
    const bookDetails = getBookDetails(book);
    makeTrBookElt(bookDetails, bookIndex);
}

// DOM
function displayEmptyMessage(){
    const newEntry = document.createElement("p");
    newEntry.innerText = `There are no books in the library! Please add some books by clicking the button in the top left`;
    document.querySelector(".library-container").appendChild(newEntry);
}

// DOM
function displayAllBooksInTable(){
    if (Library.myLibrary.isEmpty) {
        document.querySelector("#book-list").style.display = "none";
        displayEmptyMessage();
    }
    else{
        const pTag = document.querySelector(".library-container").querySelector("p");
        if (pTag !== null) pTag.remove();
        document.querySelector("#book-list").style.display = "block";
        Library.myLibrary.library.forEach(displayBookInTable);
    }
}

class TableController{
    constructor() {
        this._tableDiv = document.querySelector(".library-container");
        this._bookListElement = document.querySelector("#book-list");
        this._pTag = ""
        this._emptyTableMessage = `There are no books in the library! Please add some books by clicking the button in the top left`;
    }

    _hideTable(){
        this._bookListElement.style.display = "none";
    }

    _showTable(){
        this._bookListElement.style.display = "block";
    }

    _removePTag(){
        if (this._pTag !== "") {
            this._pTag.remove();
            this._pTag = "";
        }
    }



    render(){
        this._removeAllBooksFromTable();
        this._displayAllBooksInTable();
    }

    _removeAllBooksFromTable(){
        this._bookListElement.querySelectorAll("tr").forEach(rowElt => rowElt.id !== "row-headers" && rowElt.remove());
    }

    _displayAllBooksInTable(){
        if (Library.myLibrary.isEmpty) {
            this._hideTable();
            this._displayEmptyMessage();
        }
        else{
            this._removePTag();
            this._showTable();
            Library.myLibrary.library.forEach(displayBookInTable);
        }
    }

    _displayBookInTable(book, bookIndex){
        const bookDetails = getBookDetails(book);
        makeTrBookElt(bookDetails, bookIndex);
    }
    
    // DOM
    _displayEmptyMessage(){
        this._pTag = document.createElement("p");
        this._pTag.innerText = this._emptyTableMessage;
        this._tableDiv.appendChild(this._pTag);
    }
    

}

class FormController{
    constructor(){
        this._newBookFormElement = document.querySelector("#new-book-form");
        this._closeNewBookFormElement = document.querySelector("#close-new-book-form");
        this._newBookBtn = document.querySelector("#new-book-btn");
        this._overlayDiv = document.querySelector("#overlay");
        this._titleElement = document.querySelector("#title");
        this._authorElement = document.querySelector("#author");
        this._pagesElement = document.querySelector("#pages");
        this._readElement = document.querySelector("#read-yes");

        this._newBookFormElement.addEventListener("submit",this._addBookFromForm);
        this._closeNewBookFormElement.addEventListener('click', this._hideBookForm);
        this._newBookBtn.addEventListener('click', this._showBookForm);
        this._overlayDiv.addEventListener('click', this._closeFormOnOverlay);
    }

    _hideBookForm = () => {
        this._overlayDiv.style.display = "none";
    }

    _showBookForm = () => {
        this._overlayDiv.style.display = "flex";
    }

    _addBookFromForm = (e) => {
        // get form values
        e.preventDefault(); 
        const title = this._titleElement.value;
        const author = this._authorElement.value;
        const pages = parseInt(this._pagesElement.value);
        const read = this._readElement.checked ? true : false;
    
        this._newBookFormElement.reset();
    
        Library.myLibrary.addBookToLibrary(title, author, pages, read);
        LibraryStorage.storage.updateStorage();
        refreshTable();
    
        if (e.submitter.id === "submit-new-book") this._hideBookForm();
    }

    _closeFormOnOverlay = (e) => {
        if (e.target.id !== "overlay") return;
        hideBookForm();
    }
}

displayAllBooksInTable();

const formController = new FormController();