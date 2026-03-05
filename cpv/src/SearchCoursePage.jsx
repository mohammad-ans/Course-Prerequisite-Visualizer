import { useCallback, useState } from 'react';
import api from './api';
import "./SearchCoursePage.css"
import debounce from "lodash.debounce"
function SearchCoursePage() {
  const [query, setQuery] = useState('');
  const [course, setCourse] = useState(null);
  const [suggested, setSuggested] = useState(null);
  const [error, setError] = useState(null);
  const [searchBy, setSearchBy] = useState("code");
  const [preReqs, setpreReqs] = useState([]);
  const [followUps, setfollowUps] = useState([]);
  const [searchSuggestions, setSuggestions] = useState([]);
  const [searchActive, setsearchActive] = useState(false);
  const debouncedSearch = useCallback(debounce((queryTemp, queryType) => callSearch(queryTemp, queryType), 300),
    [])
  async function handleSearch(e) {
    document.querySelector(".search-input").blur();
    try {
      if(query == "") {
        setCourse(null);
        setSuggested(null);
        setError("Empty String...")
      }
      const response = await api.get(`/courses/${query}`, {
        params: { searchby: searchBy }
      });
      if (response.data.msg) {
        setCourse(null);
        setSuggested(null);
        setError(response.data.msg);
        return;
      }
      if (response.data.suggested) {
        setCourse(null);
        setError(null);
        setSuggested(response.data.suggested);
        return;
      }
      setCourse(response.data.courseDetails);
      setpreReqs(pre => response.data.preReqs);
      setfollowUps(pre => response.data.followUps);
      setError(null);
      setSuggested(null);
    } catch (error) {
      console.error('Error fetching course:', error);
      setCourse(null);
    }
  };

  async function searchByCode(code) {
    const response = await api.get(`/courses/${code}`, {
      params: { searchby: "code" }
    });
    setCourse(response.data.courseDetails);
    setpreReqs(pre => response.data.preReqs);
    setfollowUps(pre => response.data.followUps);
    setSuggested(null);
    setError(null);
  }

  async function onMismatchSuggestionSelect(e) {
    try {
      let code = e.target.innerText;
      code = code.trim().replace(":", "")
      searchByCode(code);
      // console.log(course)
    }
    catch (error) {
      console.error("Error fetching course", error)
      setCourse(null);
    }
  }

  async function onSuggestionSelect(e) {
    try {
      let temp = e.target;
      let code;
      if (temp.localName == "span")
        temp = temp.parentNode;
      if (searchBy == "code")
        code = temp.children[0].innerText;
      else
        code = temp.children[1].innerText;
      searchByCode(code)
    } catch (error) {
      console.error("Error fetching course:", error);
      setCourse(null);
    }
  };
  async function handleChange(e) {
    setQuery(pre => e.target.value);
    debouncedSearch(e.target.value, searchBy);
  }

  async function callSearch(queryTemp, queryType) {
    try {
      const response = await api.get("/searchCourses", {
        params: { searchQuery: queryTemp, searchBy: queryType }
      })
      setSuggestions(response.data);
    }
    catch (e) {

    }
  }
  function enterSubmit(e) {
    if(e.keyCode == 13)
      handleSearch(e)
  }
  return (
    <div className="search-course">
      <div className="search-form">
        <div className="search-input-box">
          <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="122.879px" height="119.799px" viewBox="0 0 122.879 119.799" enableBackground="new 0 0 122.879 119.799" xmlSpace="preserve" fill="#777"><g><path d="M49.988,0h0.016v0.007C63.803,0.011,76.298,5.608,85.34,14.652c9.027,9.031,14.619,21.515,14.628,35.303h0.007v0.033v0.04 h-0.007c-0.005,5.557-0.917,10.905-2.594,15.892c-0.281,0.837-0.575,1.641-0.877,2.409v0.007c-1.446,3.66-3.315,7.12-5.547,10.307 l29.082,26.139l0.018,0.016l0.157,0.146l0.011,0.011c1.642,1.563,2.536,3.656,2.649,5.78c0.11,2.1-0.543,4.248-1.979,5.971 l-0.011,0.016l-0.175,0.203l-0.035,0.035l-0.146,0.16l-0.016,0.021c-1.565,1.642-3.654,2.534-5.78,2.646 c-2.097,0.111-4.247-0.54-5.971-1.978l-0.015-0.011l-0.204-0.175l-0.029-0.024L78.761,90.865c-0.88,0.62-1.778,1.209-2.687,1.765 c-1.233,0.755-2.51,1.466-3.813,2.115c-6.699,3.342-14.269,5.222-22.272,5.222v0.007h-0.016v-0.007 c-13.799-0.004-26.296-5.601-35.338-14.645C5.605,76.291,0.016,63.805,0.007,50.021H0v-0.033v-0.016h0.007 c0.004-13.799,5.601-26.296,14.645-35.338C23.683,5.608,36.167,0.016,49.955,0.007V0H49.988L49.988,0z M50.004,11.21v0.007h-0.016 h-0.033V11.21c-10.686,0.007-20.372,4.35-27.384,11.359C15.56,29.578,11.213,39.274,11.21,49.973h0.007v0.016v0.033H11.21 c0.007,10.686,4.347,20.367,11.359,27.381c7.009,7.012,16.705,11.359,27.403,11.361v-0.007h0.016h0.033v0.007 c10.686-0.007,20.368-4.348,27.382-11.359c7.011-7.009,11.358-16.702,11.36-27.4h-0.006v-0.016v-0.033h0.006 c-0.006-10.686-4.35-20.372-11.358-27.384C70.396,15.56,60.703,11.213,50.004,11.21L50.004,11.21z" /></g></svg>
          <input
            type="text"
            className="search-input"
            placeholder={`Course ${searchBy}`}
            value={query}
            onChange={handleChange}
            onFocus={() => setsearchActive(true)}
            onBlur={() => setsearchActive(false)}
            onKeyDown={enterSubmit}
          />
          
      {searchActive && (
        <ul className="search-suggestions" onMouseEnter={() => setsearchActive(true)}>
          {searchSuggestions.map((element) => <li key={element.code} onMouseDown={onSuggestionSelect}>
            <span className="super-search">{searchBy == "code" ? element.code : element.title}</span>
            {" ("}<span className="mini-search">{searchBy == "code" ? element.title : element.code}</span>{")"}
          </li>)}
        </ul>
      )}
        </div>
        <button onClick={handleSearch}>Search Course</button>
        <select value={searchBy} onChange={(e) => setSearchBy(e.currentTarget.value)}>
          <option value="code">Search by Code</option>
          <option value="title">Search by Title</option>
        </select>
      </div>
      <div className="course-details">
      <h2>Course Details: </h2>
      {course && (
        <div className="searched-course">
          <p><strong>Code:</strong> {course.code}</p>
          <p><strong>Title:</strong> {course.title}</p>
          <h2>Pre-requisites: </h2>
          <ul className="preRequisite-list">
            {
              preReqs.length == 0 ?
                <p>No pre-requisite courses required.</p>
                :
                preReqs.map((element) => <li key={element.code}>
                  {`${element.code} - ${element.title}`}
                </li>)
            }
          </ul>
          <h2>Follow Up Courses:</h2>
          <ul className="followUps-list">
            {
              followUps.length == 0 ?
                <p>No follow ups of this course.</p>
                :
                followUps.map((element) => <li key={element.code}>
                  {`${element.code} - ${element.title}`}
                </li>)
            }
          </ul>
        </div>
      )}
      {
        suggested && (<>
          <h2>Did you mean any of these?</h2>
        <ul className="searched-suggestions">
          {suggested.map((element) => <li key={element.code}>
            <span className="suggested-course-code" onClick={onMismatchSuggestionSelect}>{element.code}: </span>
            <span className="suggested-course-title">{element.title}</span>
          </li>
          )}
        </ul>
        </>
        )}
      {error && (
        <div className="not-found-error">{error}</div>
      )}
      </div>
    </div>
  );
}

export default SearchCoursePage;
