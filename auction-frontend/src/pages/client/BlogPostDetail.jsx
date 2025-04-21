import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../../assets/styles/client/BlogPostDetail.css';

// Reusing the same mock data to maintain consistency
const MOCK_POSTS = [
  {
    id: 1,
    title: "Alexa isn't just an assistant",
    content: `Bring to the table win-win survival strategies to ensure proactive domination. At the end of the day, going forward, a new normal that has evolved from generation X is on the runway heading towards a streamlined cloud solution.
    
    When a cat is frightened, its pupils grow bigger. This is to allow the cat to absorb as much information as possible. When the cat is angry or aroused, its pupils narrow in order to enable it to focus on tiny details. Do note, however, that since cats' pupils also change size according to the light, you should pay attention to its body language when trying to figure out how it is feeling.
    
    Mewing isn't the only sounds cats make. Mother cats are often heard making a chirping noise when they are with their kittens. This is their way of getting the attention of their kittens and communicating with them. Occasionally, you might hear your own cat using this sound on you when trying to get you to top up her feeding bowl.
    
    If you hear a cat hissing, spitting or growling, stay away, as that indicates it is frightened or angry and might react in an aggressive manner if you get too close.`,
    imageUrl: "../../images/Nen-cua-Aution.png",
    author: { name: "James Collins" },
    category: { name: "Technology" },
    createdAt: "2020-05-12"
  },
  {
    id: 2,
    title: "eBay is now selling wireless plans",
    content: `Bring to the table win-win survival strategies to ensure proactive domination. At the end of the day, going forward, a new normal that has evolved from generation X is on the runway heading towards a streamlined cloud solution.
    
    When a cat is frightened, its pupils grow bigger. This is to allow the cat to absorb as much information as possible. When the cat is angry or aroused, its pupils narrow in order to enable it to focus on tiny details. Do note, however, that since cats' pupils also change size according to the light, you should pay attention to its body language when trying to figure out how it is feeling.
    
    Mewing isn't the only sounds cats make. Mother cats are often heard making a chirping noise when they are with their kittens. This is their way of getting the attention of their kittens and communicating with them. Occasionally, you might hear your own cat using this sound on you when trying to get you to top up her feeding bowl.
    
    If you hear a cat hissing, spitting or growling, stay away, as that indicates it is frightened or angry and might react in an aggressive manner if you get too close.`,
    imageUrl: "/images/laptop-desk.jpg",
    author: { name: "James Collins" },
    category: { name: "Gadgets" },
    createdAt: "2020-06-05"
  },
  {
    id: 3,
    title: "Today's Used Smartphones",
    content: `Bring to the table win-win survival strategies to ensure proactive domination. At the end of the day, going forward, a new normal that has evolved from generation X is on the runway heading towards a streamlined cloud solution.
    
    When a cat is frightened, its pupils grow bigger. This is to allow the cat to absorb as much information as possible. When the cat is angry or aroused, its pupils narrow in order to enable it to focus on tiny details. Do note, however, that since cats' pupils also change size according to the light, you should pay attention to its body language when trying to figure out how it is feeling.
    
    Mewing isn't the only sounds cats make. Mother cats are often heard making a chirping noise when they are with their kittens. This is their way of getting the attention of their kittens and communicating with them. Occasionally, you might hear your own cat using this sound on you when trying to get you to top up her feeding bowl.
    
    If you hear a cat hissing, spitting or growling, stay away, as that indicates it is frightened or angry and might react in an aggressive manner if you get too close.`,
    imageUrl: "/images/smartphones-people.jpg",
    author: { name: "James Collins" },
    category: { name: "Gadgets" },
    createdAt: "2020-04-10"
  },
  {
    id: 4,
    title: "A Complete Guide: Keep Your iPhone Away",
    content: `Bring to the table win-win survival strategies to ensure proactive domination. At the end of the day, going forward, a new normal that has evolved from generation X is on the runway heading towards a streamlined cloud solution.
    
    When a cat is frightened, its pupils grow bigger. This is to allow the cat to absorb as much information as possible. When the cat is angry or aroused, its pupils narrow in order to enable it to focus on tiny details. Do note, however, that since cats' pupils also change size according to the light, you should pay attention to its body language when trying to figure out how it is feeling.
    
    Mewing isn't the only sounds cats make. Mother cats are often heard making a chirping noise when they are with their kittens. This is their way of getting the attention of their kittens and communicating with them. Occasionally, you might hear your own cat using this sound on you when trying to get you to top up her feeding bowl.
    
    If you hear a cat hissing, spitting or growling, stay away, as that indicates it is frightened or angry and might react in an aggressive manner if you get too close.`,
    imageUrl: "/images/iphone-desk.jpg",
    author: { name: "Sarah Johnson" },
    category: { name: "iOS" },
    createdAt: "2020-07-15"
  },
  {
    id: 5,
    title: "Browser Games For Black Friday",
    content: `Bring to the table win-win survival strategies to ensure proactive domination. At the end of the day, going forward, a new normal that has evolved from generation X is on the runway heading towards a streamlined cloud solution.
    
    When a cat is frightened, its pupils grow bigger. This is to allow the cat to absorb as much information as possible. When the cat is angry or aroused, its pupils narrow in order to enable it to focus on tiny details. Do note, however, that since cats' pupils also change size according to the light, you should pay attention to its body language when trying to figure out how it is feeling.
    
    Mewing isn't the only sounds cats make. Mother cats are often heard making a chirping noise when they are with their kittens. This is their way of getting the attention of their kittens and communicating with them. Occasionally, you might hear your own cat using this sound on you when trying to get you to top up her feeding bowl.
    
    If you hear a cat hissing, spitting or growling, stay away, as that indicates it is frightened or angry and might react in an aggressive manner if you get too close.`,
    imageUrl: "/images/gaming-setup.jpg",
    author: { name: "Mike Peters" },
    category: { name: "Gaming" },
    createdAt: "2020-06-20"
  },
  {
    id: 6,
    title: "A Smartphone Keeps Your Friend Away",
    content: `Bring to the table win-win survival strategies to ensure proactive domination. At the end of the day, going forward, a new normal that has evolved from generation X is on the runway heading towards a streamlined cloud solution.
    
    When a cat is frightened, its pupils grow bigger. This is to allow the cat to absorb as much information as possible. When the cat is angry or aroused, its pupils narrow in order to enable it to focus on tiny details. Do note, however, that since cats' pupils also change size according to the light, you should pay attention to its body language when trying to figure out how it is feeling.
    
    Mewing isn't the only sounds cats make. Mother cats are often heard making a chirping noise when they are with their kittens. This is their way of getting the attention of their kittens and communicating with them. Occasionally, you might hear your own cat using this sound on you when trying to get you to top up her feeding bowl.
    
    If you hear a cat hissing, spitting or growling, stay away, as that indicates it is frightened or angry and might react in an aggressive manner if you get too close.`,
    imageUrl: "/images/vintage-car.jpg",
    author: { name: "James Collins" },
    category: { name: "Cars" },
    createdAt: "2019-09-27",
    tags: ["car", "vintage"]
  }
];

const MOCK_RECENT_POSTS = [
  { id: 4, title: "A Complete Guide: Keep Your iPhone Away" },
  { id: 5, title: "100 Browser Games For Black Friday" },
  { id: 6, title: "A Smartphone Keeps Your Friend Away" },
  { id: 7, title: "Chromebook Tab 10 review" },
  { id: 8, title: "Black Friday vs Cyber Monday" }
];

const MOCK_CATEGORIES = [
  { id: 1, name: "Cars" },
  { id: 2, name: "Gadgets" },
  { id: 3, name: "Smart" },
  { id: 4, name: "Technology" },
  { id: 5, name: "iOS" },
  { id: 6, name: "Gaming" }
];

const MOCK_TAGS = [
  { id: 1, name: "Android" },
  { id: 2, name: "Car" },
  { id: 3, name: "Devices" },
  { id: 4, name: "Gaming" },
  { id: 5, name: "iOS" },
  { id: 6, name: "iPhone" },
  { id: 7, name: "Review" },
  { id: 8, name: "Smartphone" },
  { id: 9, name: "Space" },
  { id: 10, name: "Technology" },
  { id: 11, name: "Vintage" }
];

const MOCK_ARCHIVES = [
  { year: 2019, month: 9, monthName: "September" },
  { year: 2019, month: 6, monthName: "June" },
  { year: 2020, month: 5, monthName: "May" },
  { year: 2020, month: 4, monthName: "April" },
  { year: 2017, month: 6, monthName: "June" },
  { year: 2017, month: 5, monthName: "May" },
  { year: 2016, month: 6, monthName: "June" },
  { year: 2015, month: 4, monthName: "April" }
];

const BlogPostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, you would fetch the post from an API
    // Here we're just simulating by finding the post in our mock data
    const postId = parseInt(id);
    const foundPost = MOCK_POSTS.find(p => p.id === postId);
    
    // Simulate loading delay
    setTimeout(() => {
      setPost(foundPost);
      setLoading(false);
    }, 300);
  }, [id]);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!post) {
    return <div className="not-found">Post not found</div>;
  }

  // Split content into paragraphs
  const paragraphs = post.content.split('\n\n').filter(p => p.trim() !== '');

  return (
    <div className="blog-detail-container">
      <div className="blog-detail-content">
        <h1>{post.title}</h1>
        
        <div className="post-meta">
          <span className="author">
            <i className="fas fa-user"></i> {post.author.name}
          </span>
          <span className="category">
            <i className="fas fa-folder"></i> {post.category.name}
          </span>
          <span className="date">
            <i className="fas fa-calendar"></i> {formatDate(post.createdAt)}
          </span>
        </div>
        
        <div className="blog-detail-image">
          <img 
            src={post.imageUrl} 
            alt={post.title} 
            onError={(e) => {e.target.src = '/images/default-post.jpg'}}
          />
        </div>
        
        <div className="blog-detail-text">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        
        {post.tags && (
          <div className="post-tags">
            <span>Tags: </span>
            {post.tags.map((tag, index) => (
              <Link to={`/blog/tag/${tag}`} key={index} className="tag">
                {tag}
              </Link>
            ))}
          </div>
        )}
        
        <div className="post-navigation">
          <Link to="/blog" className="back-to-blog">Back to Blog</Link>
        </div>
        
        <div className="comments-section">
          <h3>Leave a comment</h3>
          <form className="comment-form">
            <textarea placeholder="Your comment"></textarea>
            <div className="form-row">
              <input type="text" placeholder="Your name" />
              <input type="email" placeholder="Your email" />
              <input type="text" placeholder="Your website" />
            </div>
            <button type="submit" className="add-comment">ADD COMMENT</button>
          </form>
        </div>
      </div>
      
      <div className="blog-sidebar">
        {/* Search */}
        <div className="search-box">
          <input type="text" placeholder="Search..." />
        </div>

        {/* Recent Posts */}
        <div className="sidebar-section">
          <h3>Recent Posts</h3>
          <ul>
            {MOCK_RECENT_POSTS.map(post => (
              <li key={post.id}>
                <Link to={`/blog/${post.id}`}>{post.title}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div className="sidebar-section">
          <h3>Categories:</h3>
          <ul>
            {MOCK_CATEGORIES.map(category => (
              <li key={category.id}>
                <Link to={`/blog/category/${category.name}`}>
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Tags */}
        <div className="sidebar-section">
          <h3>Post Tags:</h3>
          <div className="tags">
            {MOCK_TAGS.map(tag => (
              <Link 
                to={`/blog/tag/${tag.name}`}
                key={tag.id} 
                className="tag"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Archives */}
        <div className="sidebar-section">
          <h3>Archives</h3>
          <ul>
            {MOCK_ARCHIVES.map((archive, index) => (
              <li key={index}>
                <Link to={`/blog/archive/${archive.year}/${archive.month}`}>
                  {`${archive.monthName} ${archive.year}`}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BlogPostDetail;