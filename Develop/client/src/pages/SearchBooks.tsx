//Import necessary dependencies and components
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Container, Col, Form, Button, Card, Row } from 'react-bootstrap';
import { useMutation } from '@apollo/client';
import { SAVE_BOOK} from '../graphql/mutations';
import Auth from '../utils/auth';
import { saveBookIds, getSavedBookIds } from '../utils/localStorage';
import type { Book } from '../models/Book';
import type { GoogleAPIBook } from '../models/GoogleAPIBook';


//SearchBooks component allows users to search for and save books
const SearchBooks = () => {
  //State management for search functionality and saved books
  const [searchedBooks, setSearchedBooks] = useState<Book[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

 //Set up a mutation for saving books
const [saveBookMutation] = useMutation(SAVE_BOOK);

 //Save bookIds to localStorage on component unmount
  useEffect(() => {
    return () => saveBookIds(savedBookIds);
  });

  // Handle form submission and Google Books API search
  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${searchInput}`
      );

      if (!response.ok) {
        throw new Error('something went wrong!');
      }

      const { items } = await response.json();

      const bookData = items.map((book: GoogleAPIBook) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ['No author to display'],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || '',
      }));

      setSearchedBooks(bookData);
      setSearchInput('');
    } catch (err) {
      console.error(err);
    }
  };


//Handle saving books to user's accounts and book saving logic
   const handleSaveBook = async (bookId: string) => {
    const bookToSave: Book = searchedBooks.find((book) => book.bookId === bookId)!;
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const { data } = await saveBookMutation({
        variables: { bookData: bookToSave },
      });

      setSavedBookIds([...savedBookIds, bookToSave.bookId]);
     } catch (err) {
      console.error(err);
    }
  };


  //Component render logic
  return (
    <>
    {/* User profile header section */}
      <div className="text-light bg-dark p-5">
        <Container>
          {/* Conditional header display for username */}
          <h1>Search for Books!</h1>
          {/* Form to search books */}
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a book'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg'>
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>
{/* Search results book display*/}
      <Container>
        <h2 className='pt-5'>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        <Row>
          {/* Grid of book cards */}
          {searchedBooks.map((book) => {
            return (
              <Col md="4" key={book.bookId}>
                {/* Individual book card with image, details and save button */}
                <Card border='dark'>
                  {book.image ? (
                    <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    {/* Conditional save button display for logged in users */}
                    {Auth.loggedIn() && (
                      <Button
                        disabled={savedBookIds?.some((savedBookId: string) => savedBookId === book.bookId)}
                        className='btn-block btn-info'
                        onClick={() => handleSaveBook(book.bookId)}>
                        {savedBookIds?.some((savedBookId: string) => savedBookId === book.bookId)
                          ? 'This book has already been saved!'
                          : 'Save this Book!'}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;
