import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Modal } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import newsimg from '../assets/newsimg.jpg';
import Loader from './Loader';

function News (){
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const { category, query } = useParams(); 

  const BASE_URL = 'https://newsapi.org/v2/';
  const API_KEY = '8334741964e3454ca232655bbd22653b';

  useEffect(() => {
    fetchNews();
  }, [category, query]);

  
  const fetchNews = async () => {
    setLoading(true);
    try {
      const url = query
        ? `${BASE_URL}everything?q=${query}&apiKey=${API_KEY}`
        : `${BASE_URL}top-headlines?category=${category || 'general'}&country=us&apiKey=${API_KEY}`;

      const response = await axios.get(url);
      setNewsData(response.data.articles);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShow(false);
    setSelectedArticle(null);
  };

  const handleShow = (article) => {
    setSelectedArticle(article);
    setShow(true);
  };

  if (loading) return <Loader />;

  return (
    <div className="news-container">
      {newsData.length === 0 ? (
        <p>No news found</p>
      ) : (
        newsData.map((article, index) => (
          <Card key={index} className="mb-4" style={{ height: '100%' }}>
            <Card.Img variant="top" src={article.urlToImage || newsimg} />
            <Card.Body>
              <Card.Title>{article.title}</Card.Title>
              <Card.Text>{article.description || 'No description available.'}</Card.Text>
              <Button variant="primary" onClick={() => handleShow(article)}>
                Read More
              </Button>
            </Card.Body>
          </Card>
        ))
      )}

    
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedArticle?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Author:</strong> {selectedArticle?.author || 'Unknown'}</p>
          <p><strong>Published At:</strong> {selectedArticle?.publishedAt ? new Date(selectedArticle.publishedAt).toLocaleString() : 'N/A'}</p>
          <p><strong>Description:</strong> {selectedArticle?.description || 'No description available.'}</p>
          <p><strong>Content:</strong> {selectedArticle?.content || 'Full content not available.'}</p>
          <p>
            <strong>Read Full Article:</strong>{' '}
            <a href={selectedArticle?.url} target="_blank" rel="noopener noreferrer">
              Click Here
            </a>
          </p>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default News;
