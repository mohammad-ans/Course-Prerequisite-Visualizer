import React, { useState, useEffect, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import api from "./api";
import "./Source.css"

export default function CourseGraph() {
  const [elements, setElements] = useState([]);
  const [search, setSearch] = useState('');
  const cyRef = useRef(null); 
  const [selectedNode, setSelectedNode] = useState(null);


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
  cy.layout({ name: 'breadthfirst', directed: true, padding: 10, animate: false }).run();

}, [elements]);
  const handleSearch = () => {
    if (!search || !cyRef.current) return;

    const cy = cyRef.current;
    cy.nodes().removeClass('highlighted'); // remove previous highlights

    const node = cy.$(`#${CSS.escape(search)}`); // find node by id
    if (node.length > 0) {
      node.addClass('highlighted');
      cy.center(node); // optional: pan to node
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
        'text-halign': 'center'
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
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

  return (
    <div className='area'>
      <div className="search-bar">
      <input
        type="text"
        placeholder="Search course code..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      </div>
<CytoscapeComponent
  elements={elements}
  stylesheet={stylesheet}
  style={{ width: '800px', height: '600px' }}
  layout={{ name: 'cose', animate:false}} // automatic layout
  cy={cy => { cyRef.current = cy } } 
/>
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
