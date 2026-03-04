import React, { useState, useEffect, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import api from "./api";
import { gsap } from 'gsap/gsap-core';
import "./Source.css"

export default function CourseGraph() {
  const [elements, setElements] = useState([]);
  const [search, setSearch] = useState('');
  const cyRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [overlayNotes, setNote] = useState(true);
  const [zoomAllow, setZoom] = useState(true);
  useEffect(() => {
    api.get("/graph")
      .then(res => {
        const data = res.data;
        console.log("Graph data from backend:", data);

        // Ensure nodes have valid id and label
        const nodes = data.nodes
          .filter(node => node.id)
          .map(node => ({
            data: {
              id: node.id,
              label: node.label || node.id
            }
          }));

        // Ensure edges have valid source and target
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
        console.error("Error fetching graph:", err);
      });

  }, []);
  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;

    // Remove previous listeners
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

  // Cytoscape stylesheet with highlight style
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
        duration : 0.1,
        ease : 'power2'
      })
    else
      gsap.to(".button-circle", {
        x : 0.,
        duration : 0.1,
        ease : "power2"
    })
    
  setZoom(pre => !pre);
  }
  return (

    <div className='area'>
      {overlayNotes ? <><div className="graph-page-overlay">
      </div>
        <div className="usage-message">
          <h3>Note:</h3>
          <ul>
          <li>The graph is dynamic, meaning you can zoom in and out in the bordered area of the graph. This sometimes create a problem for some users, so zoom can be enabled or disabled using the button provided.</li>
          <li>If turned on, and to scroll down use the area outside the graph borders</li>
          <li>If stuck, refresh the page. Graph will reload again.</li>
          </ul>
          <button className="graph-button button-design" onClick={closeOverlay}>I understand</button>
        </div></> : <></>}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search course code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
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
