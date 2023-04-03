import logo from './logo.svg';
import './App.css';
import {Container, Button, Modal, Spinner,Table} from 'react-bootstrap'
import { useEffect, useState } from 'react';
const sdk = require("@krypc/web3-sdk")
const Web3Engine = new sdk.Web3Engine("CDGWZKSMaOvI6I1JU4zl65hQfkNeXlMf")
const ethers = Web3Engine.ethers



function App() {
 

  const [provider, setProvider] = useState('')
  const [signer, setSigner] = useState('')
  const [address, setAddress] = useState('')
  const [connectedStatus, setConnectedStatus] = useState(false)
  const [chainId, setChainId] = useState('')
  const [chainName, setChainName] = useState('')
  const [balance, setBalance] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [inputamount, setInputAmount] = useState('')
  const [ens , setEns] = useState('')
  const [receiptUrl, setReceiptUrl] = useState('')
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [isLoading, setIsLoading] = useState(false);
  
  

  
  async function connectWallet() {
    const walletOptions = ["coinbase", "walletconnect"]
    const [provider, signer, address] = await Web3Engine.Utils.connectWallet(walletOptions)
    setAddress(address)
    setProvider(provider)
    setSigner(signer)
    setConnectedStatus(true)
    const chainId = await Web3Engine.Wallet.getCurrentChainId(provider)
    setChainId(chainId)
    console.log(chainId)
    const chainName = await Web3Engine.Wallet.getCurrentChainName(provider)
    setChainName(chainName)
    console.log(chainName)
    let balance = await Web3Engine.Wallet.getBalance(address,chainId)
    console.log(balance)
    balance = parseFloat(balance);
    balance = balance.toFixed(6);
    setBalance(balance)
  }

  async function disconnectWallet() {
    setProvider('')
    setSigner('')
    setAddress('')
    setChainId('')
    setChainName('')
    setBalance('')
    setInputValue('')
    setInputAmount('')
    setEns('')
    setReceiptUrl('')
    setConnectedStatus(false)

    
  }
 

  const generateReceipt = async (transferwei,myAddress) => {
    var receipt_content;
    if (inputValue.endsWith(".eth")) {
      receipt_content = {
        "payment_sender": address,
        "receiver": myAddress,
        "receiver_ens": inputValue,
        "transfer_amount": inputamount,
        "chain": chainId,
        "tx hash": transferwei
      }
    }
    else {
      receipt_content = {
        "payment_sender": address,
        "receiver": inputValue,
        "transfer_amount": inputamount,
        "chain": chainId,
        "tx hash": transferwei
      }
    }

    const receipt = JSON.stringify(receipt_content);
    const cid = await Web3Engine.Storage.uploadtoIPFS(receipt);
    const receipt_url = Web3Engine.Storage.ipfsGateway + cid;
    setReceiptUrl(receipt_url);  
    
  }
  



  const validateInput = async (amount) => {
    var amount_float = parseFloat(amount);
    if (!amount_float || amount_float < 0) {
      alert("Please enter a valid amount")
      return false
    }
    else if (amount_float > balance) {
      alert("Insufficient funds")
      return false
    }
    else {
      setInputAmount(amount_float)
      return true
    }
  }

  async function validAddress(myAddress, isValid, amount){
    if (myAddress == null) {
      alert("Invalid ENS Name");
    }
    else if (myAddress == address) {
      alert("Cannot transfer to self");

    }
    else if (isValid) {
      const transferwei = await Web3Engine.Wallet.transfer(myAddress, signer, amount)

      handleShow()
      if (transferwei) {
        generateReceipt(transferwei, myAddress)
       
      }
    }
  }

  async function validEns(isValid, inputValue, amount){
    if (!isValid) {
      alert("Invalid Input !")
      return false;
    }
    else if (inputValue == address) {
      alert("Cannot transfer to self");
      return false;
    }
    else if (isValid) {
      const transferwei = await Web3Engine.Wallet.transfer(inputValue, signer, amount)
      handleShow()
      if (transferwei) {
        generateReceipt(transferwei, inputValue)
    
      }
    }
  }

  async function checkAddressorEns(inputValue,amount){
    if (inputValue.endsWith(".eth")) {
      setEns(inputValue)
      const myAddress = await Web3Engine.Utils.resolveENStoAddress(inputValue);
      var isValid = ethers.utils.isAddress(myAddress);
      await validAddress(myAddress,isValid,amount)
    }
    else {
      var isValid = ethers.utils.isAddress(inputValue);
      validEns(isValid,inputValue,amount)
    }
  }



  async function handleButtonClick(e){
    e.preventDefault()
    if (inputValue && inputamount) {
      let amount = ethers.utils.parseUnits(inputamount.toString(), "ether");
      if(await validateInput(inputamount)){
        setIsLoading(true)
        await checkAddressorEns(inputValue, amount)
        setIsLoading(false)
      }
    }
    
    setIsLoading(false)

  }

  return (
    <div className="App">
      <div className="App-header">
        <div className='heading'>
        <h3 className='appname'>Test Dapp </h3>
        <Button className='button' onClick = {async ()=>{
              if(!connectedStatus)
                await connectWallet()
              else
                await disconnectWallet()
            }} variant="outline-light">{connectedStatus ? "Disconnect ❌":"Connect Wallet"}</Button>
        </div>
        {!connectedStatus && <div className='main'>Blockchain</div>}
        {connectedStatus && (
        <div className='centerpart' >
        <div className='walletinfo'>
        {address && <h6  >Connected Address: {address}</h6>}
        {chainName && <h6>Active Chain Name: {chainName}</h6>}
        {chainId && <h6>Active Chain Id: {chainId}</h6>}
        {chainId && <h6>Balance (inEth) : {balance}</h6>}
        </div>
            <div className='cryptotransfer glassmorphism'>  
        {chainId && <h6 style={{marginTop:"5%", fontSize:"1.2rem"}}>Address/ENS</h6>}
              {chainId && <input type="text" value={inputValue} className="textarea" style={{ padding:"0.5rem", marginTop: "5%", fontSize:"1rem", }} onChange={(e) => setInputValue(e.target.value)} style={{ marginTop: "1%", height: "2rem",borderColor:"white"}}/>}
              {chainId && <h6 style={{ marginTop: "5%" , fontSize:"1.2rem"}}>Amount (inEth)</h6>}
              {chainId && <input type="text" className="textarea" value={inputamount} style={{ marginTop: "5%" }} onChange={(e) => setInputAmount(e.target.value)} style={{fontSize:"1rem", marginTop: "1%", height: "2rem", borderColor: "white" }} />}
        <br></br>
              {chainId && <Button variant="outline-light" style={{marginTop:"1rem"}} onClick={handleButtonClick} >Send</Button>}
        <br></br>
              {isLoading && <Spinner animation="border" variant="primary" />}
        </div> 
        </div>
        )}
        {/* {receiptUrl && <a href={receiptUrl}>IPFS Receipt Link</a>} */}
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>IPFS Receipt Link</Modal.Title>
          </Modal.Header>
          <Modal.Body>Generating reciept..<a href={receiptUrl}>IPFS Receipt Link</a></Modal.Body>
          <Modal.Footer>
          </Modal.Footer>
        </Modal>
    
      </div>
    </div>
  );
}

export default App;
