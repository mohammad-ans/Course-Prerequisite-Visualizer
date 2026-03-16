import { useNavigate } from "react-router-dom";
import "./degree.css"
export default function Semester(props) {
    const navigate = useNavigate();
    async function navigateSearch(e) {
        const code = e.currentTarget.children[0].innerText;
        navigate(`/search?code=${code}`);
    }
    return (
        <div className="semester">
            <h3>{`Semester ${props.element.semNo}`}</h3>
            <ul className="courses">
                {props.element.courses.map(element => <li key={element.code} onClick={navigateSearch}>
                    <span className="code">{element.code}</span>
                    <p className="title">{element.title}</p>
                </li>)}
            </ul>
        </div>
    )
}