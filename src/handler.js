const { nanoid } = require('nanoid');
const bookshelf = require("./bookshelf");
const addBooksHandler = (request, h) => {
    const { 
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
     } = request.payload;

     if(!name) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku'
        });
        response.code(400);
        return response;
     }

     if(readPage > pageCount){
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
        });
        response.code(400);
        return response;
     }

     const id = nanoid(16);
     const finished = pageCount === readPage;
     const insertedAt = new Date().toISOString();
     const updatedAt = insertedAt;

     const newbook = {
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        insertedAt,
        updatedAt,
     };

     bookshelf.push(newbook);
     const isSuccess = bookshelf.filter((book) => book.id === id).length > 0;

     if(isSuccess){
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil ditambahkan',
            data:{
                bookId: id,
            },
        });
        response.code(201)
        return response;
     }


};

const getAllBooksHandler = (request, h) => {
    const { name, reading, finished } = request.query;

    const filteredBooks = bookshelf.filter((book) => {
        const bookName = book.name.toLowerCase();

        const nameMatch = !name || bookName.includes(name.toLowerCase());
        const readingMatch = typeof reading === "undefined" || book.reading === (reading === "1");
        const finishedMatch = typeof finished === "undefined" || book.finished === (finished === "1");

        return nameMatch && readingMatch && finishedMatch;
    });

    const books = filteredBooks.map(book => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher
    }));

    const response = h.response({
        status: 'success',
        data: {
            books: books
        }
    });
    response.code(200);
    return response;
}

const getBooksByIdHandler = (request, h) => {
    const { bookId } = request.params;
    const book = bookshelf.filter((b) => b.id === bookId)[0];
    if (book){
        const response = h.response({
            status: 'success',
            data: {
                book,
            }
        });
        response.code(200);
        return response;
    }

    const response = h.response({
        status: 'fail',
        message: 'Buku tidak ditemukan',
    });
    response.code(404);
    return response;
};

const editBooksHandler = (request, h) => {
    const { bookId } = request.params;
    const { 
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
    } = request.payload;

     if(!name) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Mohon isi nama buku'
        });
        response.code(400);
        return response;
    }

     if(readPage > pageCount){
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount'
        });
        response.code(400);
        return response;
    }

    const finished = pageCount === readPage;
    const updatedAt = new Date().toISOString();
    const index = bookshelf.findIndex((b) => b.id === bookId);
    if (index !== -1) {
        bookshelf[index] = {
            ...bookshelf[index],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        finished,
        updatedAt,
        };
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil diperbarui',
        });
        response.code(200);
        return response;
    }
    const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan',
    });
    response.code(404);
    return response;
};

const deleteBooksHandler = (request, h) => {
    const { bookId } = request.params;
    const index = bookshelf.findIndex((b) => b.id === bookId);

    if (index !== -1) {
        bookshelf.splice(index, 1);
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil dihapus',
        });
        response.code(200);
        return response;
    }

    const response = h.response({
        status: 'fail',
        message: 'Buku gagal dihapus. Id tidak ditemukan',
    });
    response.code(404);
    return response;
};



module.exports = { 
    addBooksHandler,
    getAllBooksHandler,  
    getBooksByIdHandler, 
    editBooksHandler, 
    deleteBooksHandler
};