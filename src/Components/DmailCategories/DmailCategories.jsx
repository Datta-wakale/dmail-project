import "./DmailCategories.css";

const DmailCategories = ({ selectedCategory, setSelectedCategory }) => {
  return (
    <div className="mail-categories">

      <button
        className={`mail-category-btn ${
          selectedCategory === "primary" ? "active" : ""
        }`}
        onClick={() => setSelectedCategory("primary")}
      >
        <span className="category-icon">▣</span>
        <span>Primary</span>
      </button>

      <button
        className={`mail-category-btn ${
          selectedCategory === "promotions" ? "active" : ""
        }`}
        onClick={() => setSelectedCategory("promotions")}
      >
        <span className="category-icon">%</span>
        <span>Promotions</span>
      </button>

      <button
        className={`mail-category-btn ${
          selectedCategory === "social" ? "active" : ""
        }`}
        onClick={() => setSelectedCategory("social")}
      >
        <span className="category-icon">●</span>
        <span>Social</span>
      </button>

      <button
        className={`mail-category-btn ${
          selectedCategory === "updates" ? "active" : ""
        }`}
        onClick={() => setSelectedCategory("updates")}
      >
        <span className="category-icon">↻</span>
        <span>Updates</span>
      </button>

    </div>
  );
};

export default DmailCategories