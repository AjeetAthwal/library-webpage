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

        getReadEntry() {
            return this.read === true ? "Yes" : "No";
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

// DOM
function hideBookForm(){
    document.querySelector("#overlay").style.display = "none";
}

//DOM
function showBookForm(){
    document.querySelector("#overlay").style.display = "flex";
}

// DOM / Library
function addBookFromForm(e){
    // get form values
    e.preventDefault(); 
    const title = document.querySelector("#title").value;
    const author = document.querySelector("#author").value;
    const pages = parseInt(document.querySelector("#pages").value);
    const read = document.querySelector("#read-yes").checked ? true : false;

    document.querySelector("#new-book-form").reset();

    Library.myLibrary.addBookToLibrary(title, author, pages, read);
    LibraryStorage.storage.updateStorage();
    refreshTable();

    if (e.submitter.id === "submit-new-book") hideBookForm();
}

// DOM
function closeFormOnOverlay(e){
    if (e.target.id !== "overlay") return;
    hideBookForm();
}

// DOM
displayAllBooksInTable();

// DOM
document.querySelector("#new-book-form").addEventListener("submit",addBookFromForm)
document.querySelector("#close-new-book-form").addEventListener('click', hideBookForm);
document.querySelector("#new-book-btn").addEventListener('click', showBookForm);
document.querySelector("#overlay").addEventListener('click',closeFormOnOverlay);