import { Link } from "react-router-dom";

export default function DashboardBox(props) {
    return(
        <Link to={props.link}>
        <div className="dashboard-box">
            <h2 className="box-heading">
                {props.name}
            </h2>
        </div>
        </Link>
    )
}