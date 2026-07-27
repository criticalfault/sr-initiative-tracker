import { useState } from 'react';
import { Container, InputGroup, Card, Form, Button, Col, Row, Modal } from 'react-bootstrap';
import ConditionMonitor from './ConditionMonitor/ConditionMonitor';
import ButtonConfirm from './ButtonConfirm';
import './List.css';

let nextId = 0;

export default function List() {
  const initialList = [];
  const [ShowConditionMonitors, SetShowConditionMonitors] = useState(true);
  const [ConditionMonitorsEffectInitiative, SetConditionMonitorsEffectInitiative] = useState(true);
  const [EditionSwitch, EditionSwitchSet] = useState(false);
  const [InitiativeList, setInitiativeList] = useState(initialList);
  const [showModal, setShowModal] = useState(false)
  const [selectedCardIndex, setSelectedCardIndex] = useState(null); // State to track the selected card

  const handleCardClick = (index) => { // Function to handle card click
      setSelectedCardIndex(index); // Update the selected card index
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleModalOpen = () => {
    setShowModal(true);
  };

  const  handleSaveProject = (event) => {
    let systemJSON =JSON.stringify(InitiativeList);
    const blob = new Blob([systemJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
  
    // Create a link element and trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'InitativeList.json';
    link.click();
  
    // Clean up by revoking the object URL
    URL.revokeObjectURL(url);
    let Edition = '2nd';
    if(EditionSwitch){
      Edition = '3rd';
    }
  }

const handleLoadProject = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        const fileData = e.target.result;
        let inits = JSON.parse(fileData);
        setInitiativeList(inits);
        nextId = inits.length;
        setShowModal(false);
    }
    reader.readAsText(file); 
  }

  const handleChangeInitiative = (event) => {
    const { value, dataset } = event.target;
    const { key } = dataset;
    
    setInitiativeList((prevState) =>
      prevState.map((actor) =>
        actor.id === parseInt(key) ? { ...actor, initiative: value } : {...actor}
      )
    );
  };

  const handleChangeEdition = (event) => {
    EditionSwitchSet(event.target.checked);
  }

  const handleConditionMonitorsEffectInitiative = (event) => {
    SetConditionMonitorsEffectInitiative(event.target.checked);
  }

  const handleShowConditionMonitors = (event) => {
    SetShowConditionMonitors(event.target.checked);
  }

  const handleConditionSelect = (number, type, reset, key) => {
    if(reset === true){
      applyInitiativePenalty(0, type, key);
    }else{
      const penalty = getInitiativePenalty(number);
      applyInitiativePenalty(penalty, type, key);
    }
  }

  const applyInitiativePenalty = (penalty, type, key) => {
    if(type === 'P') {
      setInitiativeList((prevList) =>
        prevList.map((actor) => (
          actor.id+'P' === key ? { ...actor, PPenalty: penalty } : {...actor}
        ))
      );
    }else if(type === 'S') {
      setInitiativeList((prevList) =>
        prevList.map((actor) => (
          actor.id+'S' === key ? { ...actor, SPenalty: penalty } : {...actor}
        ))
      );
    }
  };

  const getInitiativePenalty = (number) => {
    switch (number) {
      case -1:
        return 0;
      case 0:
      case 1:
        return -1;
      case 2:
      case 3:
      case 4:
        return -2;
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
        return -3;
      default:
        return 0;
    }
  };

  const renderInitiativeList = () => {
    let originalList = InitiativeList.slice();
    let finalList = [];

    originalList.sort(function (a, b) {
      return b.initiative - a.initiative;
    });
  
    while (originalList.length > 0) {
      let tempInitHolder = { ...originalList.shift() };
      if(ConditionMonitorsEffectInitiative){
        if(!tempInitHolder.hasOwnProperty('skipWoundPhase') || tempInitHolder.hasOwnProperty('skipWoundPhase') !== true){
          tempInitHolder.initiative = parseInt(tempInitHolder.initiative) + parseInt(tempInitHolder.SPenalty) + parseInt(tempInitHolder.PPenalty);
        }else{
          tempInitHolder.initiative = parseInt(tempInitHolder.initiative);
        }
      }else{
        tempInitHolder.initiative = parseInt(tempInitHolder.initiative);
      }
     
      finalList.push({...tempInitHolder});
      tempInitHolder.initiative -= 10;
      if(tempInitHolder.initiative > 0) {
        tempInitHolder.skipWoundPhase = true;
        originalList.push(tempInitHolder);
      }
    }
  
    if(!EditionSwitch){
      finalList.sort(function (a, b) {
        return b.initiative - a.initiative;
      });
    }
    return finalList;

  };

  const onConfirmDel = (type, param, id) =>
  {
    if(type === 'yes') {
      setInitiativeList(InitiativeList.filter((a) => a.id !== id));
    }
  }

  const ConditionMonitorsToRender = (actor) =>{
    if(ShowConditionMonitors){
      return ( <>
                <ConditionMonitor type="S" key={actor.id+'S'} targetID={actor.id+'S'} onConditionSelect={handleConditionSelect} />
                <ConditionMonitor type="P" key={actor.id+'P'} targetID={actor.id+'P'} onConditionSelect={handleConditionSelect} />
              </>)
    }
  }
  
  return (
    <>
      <nav className="pv3 ph3 ph4-ns" role="navigation" style={{"background":"black"}}>
        <div className="flex-l justify-between items-center center">
          <a href="/" className="f3 fw2 hover-white no-underline white-90 dib">NullSheen Shadowrun Tools</a>
          <div className="flex-l items-center">
            <ul className="pl0 mr3">
              <li className="list f5 f4-ns fw4 dib pr3">
                <a className="hover-white no-underline white-90" href="https://matrix.nullsheen.com" title="Matrix Gen (3rd) page">Matrix Gen (3rd)</a>
              </li>
              <li className="list f5 f4-ns fw4 dib pr3">
                <a className="hover-white no-underline white-90" href="https://matrix2.nullsheen.com" title="Matrix Builder (2nd) page">Matrix Builder (2nd)</a>
              </li>
              <li className="list f5 f4-ns fw4 dib pr3">
                <a className="hover-white no-underline white-90" href="https://initiative-tracker.nullsheen.com/" title="Init Tracker page">Init Tracker</a>
              </li>
              <li className="list f5 f4-ns fw4 dib pr3"><a className="hover-white no-underline white-90" href="https://www.nullsheen.com/software/" title="Tools page">Tools</a></li>
              <li className="list f5 f4-ns fw4 dib pr3"><a className="hover-white no-underline white-90" href="https://www.nullsheen.com/contact/" title="Contact page">Contact</a></li>
              <li className="list f5 f4-ns fw4 dib pr3"><a className="hover-white no-underline white-90" href="https://www.nullsheen.com/about-me/" title="About Me page">About Me</a></li>
              <li className="list f5 f4-ns fw4 dib pr3"><a className="hover-white no-underline white-90" href="https://www.nullsheen.com/shadowrun-books/" title="Shadowrun Books Page">Shadowrun Books</a></li>
            </ul>
          </div>
        </div>
      </nav>

      <h1>Shadowrun 2nd & 3rd Edition Initative Tracker</h1>
      <Container>
        <Row>
          <Col>
          
            <Button className='saveButton' onClick={handleSaveProject}>Save Order</Button>              
            <Button className='loadButton' onClick={handleModalOpen}  >Load Order</Button>
            <br></br>
            <Modal show={showModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Upload initive List</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input type="file" accept=".json" onChange={handleLoadProject} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleModalClose}>
                        Upload
                    </Button>
                </Modal.Footer>
            </Modal>
            <h1>Actors:</h1>
            <Form><span>SR2</span>
                <Form.Check
                    value={EditionSwitch}
                    type="switch"
                    onChange={handleChangeEdition}
                /><span>SR3</span>
            </Form>
            <Form><span>Show Condition Monitors</span>
                <Form.Check
                    defaultChecked={ShowConditionMonitors} 
                    value={ShowConditionMonitors}
                    type="switch"
                    onChange={handleShowConditionMonitors}
                />
            </Form>
            <Form><span>Condition Monitors Effect Initiative</span>
                <Form.Check
                    defaultChecked={ConditionMonitorsEffectInitiative}
                    value={ConditionMonitorsEffectInitiative}
                    type="switch"
                    onChange={handleConditionMonitorsEffectInitiative}
                />
            </Form> 
            <hr />
            <InputGroup className="mb-2">
              <Form.Control id="newName" />
              <Button
                onClick={() => {
                  let name = document.getElementById('newName').value;
                  setInitiativeList([
                    ...InitiativeList,
                    {"id": nextId++, "name": name, "initiative": 1, "PPenalty":0, "SPenalty":0}
                  ]);
                }}
              >
                Add
              </Button>
            </InputGroup>
            {InitiativeList.map((actor) => (
              <Card style={{ width: '21rem', margin: '2px auto' }} key={actor.id} >
                <Card.Body>
                  <Card.Title>
                    {actor.name}: <input value={actor.initiative} style={{width:'100px'}} onChange={handleChangeInitiative} data-key={actor.id} type="number" />  <ButtonConfirm onConfirm={onConfirmDel} targetID={actor.id}  title="Delete" query="Are you sure...?"  />
                  </Card.Title>
                  SPenalty:{actor.SPenalty}  PPenalty:{actor.PPenalty}
                  {
                    ConditionMonitorsToRender(actor)
                  }
                </Card.Body>
              </Card>
            ))}
          </Col>
          <Col>
            <div>
              <h2>Initiative Order</h2>
              {renderInitiativeList(InitiativeList).map((character, index) =>{  
                const cardStyles = selectedCardIndex === index ? 
                { width: '18rem', margin: '2px auto', backgroundColor: 'rgb(0, 169, 256)', cursor: 'pointer' } : // Highlighted style
                { width: '18rem', margin: '2px auto', cursor: 'pointer' }; // Default style
                return(
                <Card style={cardStyles} key={index} onClick={() => handleCardClick(index)}>
                  <Card.Body >
                    <Card.Title>{character.name} - {character.initiative}</Card.Title>
                  </Card.Body>
                </Card>
              )})}
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}