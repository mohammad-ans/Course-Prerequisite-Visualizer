import React, { useState, useEffect, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import api from "./api";
import { gsap } from 'gsap/gsap-core';
import "./Source.css"
import { over } from 'lodash';

export default function CourseGraph() {
  const [elements, setElements] = useState([]);
  const [search, setSearch] = useState('');
  const cyRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [overlayNotes, setNote] = useState(true);
  const [zoomAllow, setZoom] = useState(true);
  const [degrees, setDegrees] = useState([]);
  const [degree, setDegree] = useState(localStorage.getItem("degree") || "");

  useEffect(()=>{
      async function getDegrees() {
          try{
              const response = await api.get("/degrees");
              setDegrees(response.data);
          }
          catch(error) {
              setError("An error occured while fetching degrees")
          }
      }
      getDegrees();
  }, [])

  function getGraphData(val) {
    api.get(`/graph/${val}`)
      .then(res => {
        const data = res.data;
        
        const nodes = data.nodes
          .filter(node => node.id)
          .map(node => ({
            data: {
              id: node.id,
              label: node.label || node.id
            }
          }));

        const edges = data.links
          .filter(link => link.source && link.target)
          .map(link => ({
            data: {
              source: link.source,
              target: link.target,
              label: link.label || ""
            }
          }));

        setElements([...nodes, ...edges]);
      })
      .catch(err => {
        console.error("Error fetching graph");
      });
  }
  useEffect(() => {
    if (degree != "")
      getGraphData(degree);
  }, []);
  useEffect(()=>{
    if(overlayNotes)
      document.body.style.overflowY = "hidden";
    else
      document.body.style.overflowY = "scroll"

  }, [overlayNotes])
  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;

    cy.removeListener('tap', 'node');

    cy.on('tap', 'node', evt => {
      const nodeData = evt.target.data();
      alert(`Course ID: ${nodeData.id}\nCourse Name: ${nodeData.label}`);
    });
    cy.layout({ name: 'breadthfirst', directed: true, spacingFactor: 1.5, padding: 10, animate: false }).run();

  }, [elements]);
  const handleSearch = () => {
    if (!search || !cyRef.current) return;

    const cy = cyRef.current;
    cy.nodes().removeClass('highlighted');

    const node = cy.$(`#${CSS.escape(search)}`); // find node by id
    if (node.length > 0) {
      node.addClass('highlighted');
    }
  };

  const stylesheet = [
    {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'background-color': '#0074D9',
        'color': '#fff',
        'text-valign': 'center',
        'text-halign': 'center',
        'width': '400'
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 4,
        'line-color': '#ccc',
        'target-arrow-color': '#ccc',
        'target-arrow-shape': 'triangle'
      }
    },
    {
      selector: '.highlighted',
      style: {
        'background-color': 'orange',
        'line-color': 'orange',
        'target-arrow-color': 'orange',
        'transition-property': 'background-color, line-color, target-arrow-color',
        'transition-duration': '0.5s'
      }
    }
  ];
  function closeOverlay() {
    setNote(pre => false);
  }
  function zoomHandler() {
    if(zoomAllow)
      gsap.to(".button-circle", {
        x : 22.5,
        backgroundColor : "#186aff",
        duration : 0.1,
        ease : "power2"
      })
    else
      gsap.to(".button-circle", {
        x : 0,
        backgroundColor : "white",
        duration : 0.1,
        ease : "power2"
    })
    
  setZoom(pre => !pre);
  }

  function degChange(e){
    const val = e.target.value;
    setDegree(val);
    localStorage.setItem("degree", val);
    getGraphData(val);
  }
  function enterSupport(e) {
    if(e.keyCode == 13)
      handleSearch()
    if(e.keyCode == 27)
      e.target.blur();
  }
  return (

    <div className="graph-area">
      {overlayNotes ? <><div className="graph-page-overlay">
      </div>
        <div className="usage-message">
          <h3>Note:</h3>
          <ul>
          <li>The graph is dynamic, meaning you can zoom in and out in the bordered area of the graph. This sometimes create a problem for some users, so zoom can be enabled or disabled using the button provided.</li>
          <li>If turned on, and to scroll down use the area outside the graph borders</li>
          <li>If stuck, refresh the page. Graph will reload again.</li>
          <li>There are many courses, so copy your course code and search for it and then zoom in the highlighted course if you want to see a specific course.</li>
          <li>If zoom is enabled, you can also click on a course and get an alert about it's name and code.</li>
          </ul>
          <button className="graph-button button-design" onClick={closeOverlay}>I understand</button>
        </div></> : <></>}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search course code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={enterSupport}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <select value={degree} onChange={degChange}>
        <option value="">Select a degree</option>
        {degrees.map(element => <option value={element.id} key={element.id}>{`${element.dtype} in ${element.dname}`}</option>)}
      </select>
      <div className="button-design-circle"><p>Allow Zoom:</p><span className="background-ofbutton" onClick={zoomHandler}><span className="button-circle"></span></span></div>
      <div className="graph-overlay-helper">
        {zoomAllow?<div className="graph-overlay"></div> : <></>}
      <CytoscapeComponent
        className='graph-component'
        elements={elements}
        stylesheet={stylesheet}
        // layout={{ name: 'cose', animate:false}} // automatic layout
        cy={cy => { cyRef.current = cy }}
      />
        
      </div>
      {selectedNode && (
        <div className="node-details">
          <h3>{selectedNode.label}</h3>
          <p>ID: {selectedNode.id}</p>
          {/* Add more details here if available */}
        </div>
      )}

    </div>
  );
}
