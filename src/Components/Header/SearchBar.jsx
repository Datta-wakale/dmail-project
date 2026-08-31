const SearchBar = ({ search, setSearch, searchFilter, setSearchFilter }) => {
  return (
    <div className="search-bar-wrap">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <select
        className="search-filter"
        value={searchFilter}
        onChange={(e) => setSearchFilter(e.target.value)}
        aria-label="Search filter"
      >
        <option value="all">All</option>
        <option value="inbox">Inbox</option>
        <option value="sent">Sent</option>
        <option value="trash">Trash</option>
        <option value="starred">Starred</option>
        <option value="spam">Spam</option>
        <option value="drafts">Drafts</option>
      </select>
    </div>
  );
};

export default SearchBar;