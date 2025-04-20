import React, { useState, useEffect } from 'react';
import '../../assets/styles/client/Blog.css';

const MOCK_POSTS = [
  {
    id: 1,
    title: "Alexa isn't just an assistant",
    excerpt: "Bring to the table win-win survival strategies to ensure proactive domination. At the end of the day, going forward, a new normal that has evolved from generation X is on the runway heading towards a streamlined cloud solution.",
    imageUrl: "/images/phone-city.jpg",
    author: { name: "James Collins" },
    category: { name: "Technology" },
    createdAt: "2020-05-12"
  },
  {
    id: 2,
    title: "eBay is now selling wireless plans",
    excerpt: "Bring to the table win-win survival strategies to ensure proactive domination. At the end of the day, going forward, a new normal that has evolved from generation X is on the runway heading towards a streamlined cloud solution.",
    imageUrl: "/images/laptop-desk.jpg",
    author: { name: "James Collins" },
    category: { name: "Gadgets" },
    createdAt: "2020-06-05"
  },
  {
    id: 3,
    title: "Today's Used Smartphones",
    excerpt: "Bring to the table win-win survival strategies to ensure proactive domination. At the end of the day, going forward, a new normal that has evolved from generation X is on the runway heading towards a streamlined cloud solution.",
    imageUrl: "/images/smartphones-people.jpg",
    author: { name: "James Collins" },
    category: { name: "Gadgets" },
    createdAt: "2020-04-10"
  },
  {
    id: 4,
    title: "A Complete Guide: Keep Your iPhone Away",
    excerpt: "Bring to the table win-win survival strategies to ensure proactive domination. At the end of the day, going forward, a new normal that has evolved from generation X is on the runway heading towards a streamlined cloud solution.",
    imageUrl: "/images/iphone-desk.jpg",
    author: { name: "Sarah Johnson" },
    category: { name: "iOS" },
    createdAt: "2020-07-15"
  },
  {
    id: 5,
    title: "Browser Games For Black Friday",
    excerpt: "Bring to the table win-win survival strategies to ensure proactive domination. At the end of the day, going forward, a new normal that has evolved from generation X is on the runway heading towards a streamlined cloud solution.",
    imageUrl: "/images/gaming-setup.jpg",
    author: { name: "Mike Peters" },
    category: { name: "Gaming" },
    createdAt: "2020-06-20"
  }
];

const MOCK_RECENT_POSTS = [
  { id: 4, title: "A Complete Guide: Keep Your iPhone Away" },
  { id: 5, title: "100 Browser Games For Black Friday" },
  { id: 6, title: "Mortgage Task Documentation Part IV" },
  { id: 7, title: "Chromification: Tab UI Review" },
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
  { id: 11, name: "Vehicle" }
];

const MOCK_ARCHIVES = [
  { year: 2019, month: 9, monthName: "September" },
  { year: 2019, month: 6, monthName: "June" },
  { year: 2020, month: 5, monthName: "May" },
  { year: 2020, month: 4, monthName: "April" }
];

const Blog = () => {
  // Số bài viết trên mỗi trang
  const postsPerPage = 4;
  
  // State cho tìm kiếm và phân trang
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState(MOCK_POSTS);
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  // Tính toán số trang và danh sách bài viết cho trang hiện tại
  useEffect(() => {
    // Tính tổng số trang dựa trên số bài viết và số bài viết trên mỗi trang
    const calculatedTotalPages = Math.ceil(filteredPosts.length / postsPerPage);
    setTotalPages(calculatedTotalPages);
    
    // Nếu currentPage vượt quá totalPages (có thể xảy ra khi lọc), reset về trang 1
    if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
      setCurrentPage(1);
    }
    
    // Tính index bắt đầu và kết thúc cho trang hiện tại
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    
    // Lấy danh sách bài viết cho trang hiện tại
    setDisplayedPosts(filteredPosts.slice(startIndex, endIndex));
  }, [filteredPosts, currentPage]);

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const query = e.target.value.toLowerCase();
      setSearchQuery(query);
      
      if (query) {
        const results = MOCK_POSTS.filter(post => 
          post.title.toLowerCase().includes(query) || 
          post.excerpt.toLowerCase().includes(query)
        );
        setFilteredPosts(results);
      } else {
        setFilteredPosts(MOCK_POSTS);
      }
      
      setCurrentPage(1);
    }
  };

  // Lọc theo danh mục
  const filterByCategory = (categoryName) => {
    const results = MOCK_POSTS.filter(post => 
      post.category.name === categoryName
    );
    setFilteredPosts(results);
    setSearchQuery(`category:${categoryName}`);
    setCurrentPage(1);
  };

  // Lọc theo tag
  const filterByTag = (tagName) => {
    // Trong dữ liệu mẫu, giả lập lọc bằng cách trả về posts có title chứa tagName
    const results = MOCK_POSTS.filter(post => 
      post.title.toLowerCase().includes(tagName.toLowerCase())
    );
    setFilteredPosts(results);
    setSearchQuery(`tag:${tagName}`);
    setCurrentPage(1);
  };

  // Lọc theo ngày
  const filterByDate = (year, month) => {
    const dateString = `${year}-${month.toString().padStart(2, '0')}`;
    const results = MOCK_POSTS.filter(post => 
      post.createdAt.startsWith(dateString)
    );
    setFilteredPosts(results);
    setSearchQuery(`date:${year}-${month}`);
    setCurrentPage(1);
  };

  // Reset bộ lọc
  const resetFilters = () => {
    setFilteredPosts(MOCK_POSTS);
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Format ngày
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Tạo các liên kết phân trang
  const renderPaginationLinks = () => {
    const links = [];
    
    // Nút Previous
    links.push(
      <a 
        href="#" 
        key="prev"
        className="prev" 
        onClick={(e) => {
          e.preventDefault();
          if (currentPage > 1) setCurrentPage(currentPage - 1);
        }}
      >
        Previous
      </a>
    );
    
    // Links số trang
    for (let i = 1; i <= totalPages; i++) {
      links.push(
        <a 
          href="#" 
          key={i}
          className={`page ${currentPage === i ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setCurrentPage(i);
          }}
        >
          {i}
        </a>
      );
    }
    
    // Nút Next
    links.push(
      <a 
        href="#" 
        key="next"
        className="next" 
        onClick={(e) => {
          e.preventDefault();
          if (currentPage < totalPages) setCurrentPage(currentPage + 1);
        }}
      >
        Next
      </a>
    );
    
    return links;
  };

  return (
    <div className="blog-container">
      <div className="blog-content">
        {/* Hiển thị kết quả tìm kiếm nếu có */}
        {searchQuery && (
          <div className="search-results">
            <h3>Kết quả tìm kiếm: {searchQuery}</h3>
            <button className="reset-filter" onClick={resetFilters}>Xóa bộ lọc</button>
          </div>
        )}

        {/* Danh sách bài viết */}
        {displayedPosts.length === 0 ? (
          <div className="no-posts">Không tìm thấy bài viết nào.</div>
        ) : (
          displayedPosts.map((post) => (
            <div className="blog-post" key={post.id}>
              <div className="blog-image">
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  onError={(e) => {e.target.src = '/images/default-post.jpg'}}
                />
              </div>
              <div className="blog-info">
                <h2>{post.title}</h2>
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
                <p>{post.excerpt}</p>
                <button className="read-more">READ MORE</button>
              </div>
            </div>
          ))
        )}

        {/* Phân trang */}
        {filteredPosts.length > 0 && (
          <div className="pagination">
            {renderPaginationLinks()}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="blog-sidebar">
        {/* Tìm kiếm */}
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search..." 
            onKeyUp={handleSearch}
            defaultValue={searchQuery.startsWith('category:') || searchQuery.startsWith('tag:') || searchQuery.startsWith('date:') ? '' : searchQuery}
          />
        </div>

        {/* Bài viết gần đây */}
        <div className="sidebar-section">
          <h3>Recent Posts</h3>
          <ul>
            {MOCK_RECENT_POSTS.map(post => (
              <li key={post.id}>
                <a href="#">{post.title}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Danh mục */}
        <div className="sidebar-section">
          <h3>Categories:</h3>
          <ul>
            {MOCK_CATEGORIES.map(category => (
              <li key={category.id}>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    filterByCategory(category.name);
                  }}
                >
                  {category.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Tags */}
        <div className="sidebar-section">
          <h3>Post Tags:</h3>
          <div className="tags">
            {MOCK_TAGS.map(tag => (
              <a 
                href="#" 
                key={tag.id} 
                className="tag"
                onClick={(e) => {
                  e.preventDefault();
                  filterByTag(tag.name);
                }}
              >
                {tag.name}
              </a>
            ))}
          </div>
        </div>

        {/* Archives */}
        <div className="sidebar-section">
          <h3>Archives</h3>
          <ul>
            {MOCK_ARCHIVES.map((archive, index) => (
              <li key={index}>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    filterByDate(archive.year, archive.month);
                  }}
                >
                  {`${archive.monthName} ${archive.year}`}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Blog;