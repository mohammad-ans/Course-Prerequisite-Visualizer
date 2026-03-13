import { useEffect, useRef, useState } from "react"
import "./home.css"
import { gsap } from "gsap/gsap-core";
import { useGSAP } from "@gsap/react";

export default function Home() {
    const [currentSelection, setSelection] = useState(0);
    const [answer, setAnswer] = useState("No");
    useEffect(()=>{
        function tim(){
            const temp = (currentSelection + 1) % 5;
            const element = document.querySelector(`.green-button${currentSelection}`)
            if(element){
                element.classList.remove("active-button")
                document.querySelector(`.green-button${temp}`).classList.add("active-button");
            }
            setSelection(temp);
        }
        const temp = setTimeout(tim, 2500)
        return () => clearTimeout(temp);

    }, [currentSelection])
    function questionHandler(e) {
        if(answer != "No"){
            let el = document.querySelector(`.plus${answer}`).children[1].children[1];
            gsap.to(el, {
                rotate : "90deg",
                overwrite : "auto"
            })
        }
        let temp = e.currentTarget.classList[1];
        let temp2 = temp.replace(/[a-zA-Z]/g, "");
        if(temp2 != answer){
            setAnswer(temp2);
            let el = document.querySelector(`.${temp}`).children[1].children[1];
            console.log(el);
            gsap.to(el, {
                rotate : "0deg",
                overwrite : "auto"
            })
        }
        else{
            setAnswer("No");
        }
    }
    useGSAP(()=>{
        const timeline = gsap.timeline();
        timeline.to(".start-animation", {
            y : 0,
            duration : 0.7,
            stagger : 0.6,
            ease : "sine"
        })
        timeline.to(".start-animation2", {
            transform : "translate3d(0, 0%, 0) scale3d(1, 1, 1)",
            lineHeight : "4.5rem",
            duration : 0.6,
            ease : "power1"
        })
        timeline.to(".visibility-hidden", {
            visibility : "visible",
            duration: 0.1,
            ease : "sine.in"
        })
    }, [])
    function activeButtonHandler(e, active){
        setSelection(s => active); 
        document.querySelector(".active-button").classList.remove("active-button");
        e.currentTarget.classList.add("active-button") 
    }
    return (
        <>
            <div className="main-text">
                <div className="first-part">
                    <div className="plain-part start-animation2">
                        <p className="start-animation">WHERE</p>
                    </div>
                    <div className="plain-part start-animation2">
                        <p className="start-animation">YOUR PATHS</p>
                    </div>
                    <div className="blue-part start-animation2">
                        <p className="start-animation">BECOME CLEAR</p>
                    </div>
                </div>
                <div className="second-part visibility-hidden">
                    <div>Everything is built and designed</div> <div>to help students so that they can understand their </div> <div>degree structure by eliminating prerequisite confusion</div> <div> and thus achieve their goals.</div>
                </div>
                <div className="nav-button-2 visibility-hidden">Search Courses</div>
            </div>
            <div className="benefit-text-container">
                <div className="green-buttons">
                    <div className="active-button green-button green-button0" onClick={e => activeButtonHandler(e, 0)}>Visualize</div>
                    <div className="green-button green-button1" onClick={e => activeButtonHandler(e, 1)}>Understand</div>
                    <div className="green-button green-button2" onClick={e => activeButtonHandler(e, 2)}>Plan</div>
                    <div className="green-button green-button3" onClick={e => activeButtonHandler(e, 3) }>Explore</div>
                    <div className="green-button green-button4" onClick={e => activeButtonHandler(e, 4) }>Simplify</div>
                </div>
                <div className="benefit-text">
                    {currentSelection == 0 ? <div>Turn prerequisite data into clear graphical relationships.</div> : <></>}
                    {currentSelection == 1 ? <div>Quickly grasp course dependencies and academic structure at a glance.</div> : <></>}
                    {currentSelection == 2 ? <div>Understand course dependencies to plan your academic path.</div> : <></>}
                    {currentSelection == 3 ? <div>Search and inspect individual courses to view their prerequisite relationships.</div> : <></>}
                    {currentSelection == 4 ? <div>Reduce complexity by presenting academic data in a clear and organized way.</div> : <></>}
                </div>
            </div>
            <div className="white-container">
                <div className="resources">
                    <div className="resource resource-1">
                        <div className="date">DEC 27, 2025</div>
                        <div className="heading">Get Started</div>
                        <div className="paragraph">Lorem ipsum dolor, Consectetur consequatur exercitationem quae a voluptatem, molestias veritatis nulla tempore nam cupiditate deleniti. Nulla ea aut asperiores exercitationem eligendi porro enim? Esse iusto corrupti commodi qui voluptatem amet laboriosam nesciunt voluptates assumenda?</div>
                        <div className="separator"></div>
                        <div className="learn-more">Learn More <span className="arrow">&rarr;</span></div>
                    </div>
                    <div className="resource resource-1">
                        <div className="date">DEC 27, 2025</div>
                        <div className="heading">Get Started</div>
                        <div className="paragraph">Lorem ipsum dolor, Consectetur consequatur exercitationem quae a voluptatem, molestias veritatis nulla tempore nam cupiditate deleniti. Nulla ea aut asperiores exercitationem eligendi porro enim? Esse iusto corrupti commodi qui voluptatem amet laboriosam nesciunt voluptates assumenda?</div>
                        <div className="separator"></div>
                        <div className="learn-more">Learn More <span className="arrow">&rarr;</span></div>
                    </div>
                    <div className="resource resource-1">
                        <div className="date">DEC 27, 2025</div>
                        <div className="heading">Get Started</div>
                        <div className="paragraph">Lorem ipsum dolor, Consectetur consequatur exercitationem quae a voluptatem, molestias veritatis nulla tempore nam cupiditate deleniti. Nulla ea aut asperiores exercitationem eligendi porro enim? Esse iusto corrupti commodi qui voluptatem amet laboriosam nesciunt voluptates assumenda?</div>
                        <div className="separator"></div>
                        <div className="learn-more">Learn More <span className="arrow">&rarr;</span></div>
                    </div>
                </div>
                <div className="frequently-asked-questions">
                    <div className="heading">
                        Frequently Asked Questions
                    </div>
                    <div className="flex-container">
                        <div className="question">
                            <div className="separator"></div>
                            <div className="question-wrapper plus1"  onClick={questionHandler}><span className="actual-question">How does CPV works?</span><span className="plus">
                                <span className="plus-1"></span>
                                <span className="plus-2"></span>
                            </span>
                            </div>
                            {answer == "1" ? <div className="answer">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sunt, sapiente non vero, deserunt qui eveniet voluptate, voluptates quos dolor delectus praesentium nulla a excepturi esse.</div> : <></>}
                            </div>
                        <div className="question">
                            <div className="separator"></div>
                            <div className="question-wrapper plus2"  onClick={questionHandler}><span className="actual-question">How does CPV works?</span><span className="plus">
                                <span className="plus-1"></span>
                                <span className="plus-2"></span>
                            </span>
                            </div>
                            {answer == "2" ? <div className="answer">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sunt, sapiente non vero, deserunt qui eveniet voluptate, voluptates quos dolor delectus praesentium nulla a excepturi esse.</div> : <></>}
                            </div>
                        <div className="question">
                            <div className="separator"></div>
                            <div className="question-wrapper plus3" onClick={questionHandler}><span className="actual-question">How does CPV works?</span><span className="plus">
                                <span className="plus-1"></span>
                                <span className="plus-2"></span>
                            </span>
                            </div>
                            {answer == "3" ? <div className="answer">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sunt, sapiente non vero, deserunt qui eveniet voluptate, voluptates quos dolor delectus praesentium nulla a excepturi esse.</div> : <></>}
                            </div>
                    </div>
                </div>
            </div>
        </>
    )
}