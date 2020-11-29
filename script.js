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

        getKeys(){
            return ["title", "author", "pages", "read"]
        }
        
        getValues(){
            return this.getKeys().map(key => this[key]);
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

        getKeys(){
            return this._library[0].getKeys();
        }

        getValues(bookIndex){
            return this._library[bookIndex].getValues();
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

class TableController{
    constructor() {
        this._tableDiv = document.querySelector(".library-container");
        this._bookListElement = document.querySelector("#book-list");
        this._pTag = ""
        this._emptyTableMessage = `There are no books in the library! Please add some books by clicking the button in the top left`;

        this.render();
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
        LibraryStorage.storage.updateStorage();
        this._removeAllBooksFromTable();
        this._displayTable();
    }

    _removeAllBooksFromTable(){
        while(this._bookListElement.childNodes.length > 2) {
            this._bookListElement.removeChild(this._bookListElement.lastChild);
        }
    }

    _displayTable(){
        if (Library.myLibrary.isEmpty) {
            this._hideTable();
            this._displayEmptyMessage();
        }
        else{
            this._removePTag();
            this._showTable();
            this._displayAllBooksInTable();
        }
    }

    _displayEmptyMessage(){
        this._pTag = document.createElement("p");
        this._pTag.innerText = this._emptyTableMessage;
        this._tableDiv.appendChild(this._pTag);
    }
    
    _displayAllBooksInTable(){
        Library.myLibrary.library.forEach(this._addBookTrToTable)
    }

    _addBookTrToTable = (book, bookIndex) => {
        const newRowElt = document.createElement("tr");
        newRowElt.dataset.bookIndex = bookIndex;
    
        for (let bookIndex = 0; bookIndex < book.getKeys().length; bookIndex++){
            this._addTdBookElt(newRowElt, book.getKeys()[bookIndex], book)
        }
    
        this._addRemoveBtn(newRowElt);
    
        this._bookListElement.appendChild(newRowElt);
    }

    _addTdBookElt(rowElt, header, book){
        const newEntry = document.createElement("td");
        const tdDiv = document.createElement("div");
        
        // put td's in div container first
        const newDiv = document.createElement("div");
        newDiv.innerText = book.getTableEntry(header);
        tdDiv.classList = "table-entry";
        tdDiv.appendChild(newDiv);
    
        // add edit icon to read
        if (header === "read"){
            const editDiv = document.createElement("div");
            const editIcon = document.createElement("img");
            editIcon.src = "images/edit_icon.png";
            editIcon.alt = "Edit";
            editIcon.classList = "edit-icon";
            editIcon.addEventListener("click", this._toggleRead)
            editDiv.appendChild(editIcon);
            tdDiv.appendChild(editDiv);
        }
    
        newEntry.classList.add(header);
        newEntry.appendChild(tdDiv);

        rowElt.appendChild(newEntry);
    }

    _toggleRead = (e) => {
        const bookIndex = e.target.parentNode.parentNode.parentNode.parentNode.dataset.bookIndex;
        Library.myLibrary.toggleRead(bookIndex);
        this.render();
    }

    _removeBook = (e) => {
        const bookIndex = e.target.parentNode.parentNode.dataset.bookIndex;
        Library.myLibrary.removeBookFromLibrary(bookIndex);
        this.render();
    }

    _addRemoveBtn(rowElt){
        const removeBtn = document.createElement("button");
        removeBtn.classList = "no-btn";
        removeBtn.innerText = "Remove Book";
        removeBtn.addEventListener("click", this._removeBook);
    
        const removeBtnTd = document.createElement("td");
        removeBtnTd.classList = "off-table";
        removeBtnTd.appendChild(removeBtn);
    
        rowElt.appendChild(removeBtnTd);
    }
}

tableController = new TableController();

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
    
        this._addBook(title, author, pages, read);
    
        if (e.submitter.id === "submit-new-book") this._hideBookForm();
    }

    _addBook(title, author, pages, read){
        Library.myLibrary.addBookToLibrary(title, author, pages, read);
        tableController.render();
    }

    _closeFormOnOverlay = (e) => {
        if (e.target.id !== "overlay") return;
        hideBookForm();
    }
}


const formController = new FormController();