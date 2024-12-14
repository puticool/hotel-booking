import { categories } from "../data";
import "../styles/Categories.scss"
import { Link } from "react-router-dom";

const Categories = () => {
  return (
    <div  className="categories">
      <h1>Discover Your Perfect Getaway</h1>
      <p>
        Browse our diverse selection of vacation rentals designed for every traveler.
        Experience local culture, relax in comfort, and create unforgettable memories in your dream destination.
      </p>

      <div  className="categories_list">
        {categories?.slice(1, 7).map((category, index) => (
          <Link to={`/properties/category/${category.label}`}>
            <div className="category" key={index}>
              <img src={category.img} alt={category.label} />
              <div className="overlay"></div>
              <div className="category_text">
                <div id="category_text_icon" className="category_text_icon">{category.icon}</div>
                <p>{category.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;
