import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
import MemoryToken from '../abis/MemoryToken.json'
import ticket from '../lottery-ticket.jpg'

const CARD_ARRAY = [
  {
    name: 'fries',
    img: '/images/fries.png'
  },
  {
    name: 'cheeseburger',
    img: '/images/cheeseburger.png'
  },
  {
    name: 'ice-cream',
    img: '/images/ice-cream.png'
  },
  {
    name: 'pizza',
    img: '/images/pizza.png'
  },
  {
    name: 'milkshake',
    img: '/images/milkshake.png'
  },
  {
    name: 'hotdog',
    img: '/images/hotdog.png'
  },
  {
    name: 'fries',
    img: '/images/fries.png'
  },
  {
    name: 'cheeseburger',
    img: '/images/cheeseburger.png'
  },
  {
    name: 'ice-cream',
    img: '/images/ice-cream.png'
  },
  {
    name: 'pizza',
    img: '/images/pizza.png'
  },
  {
    name: 'milkshake',
    img: '/images/milkshake.png'
  },
  {
    name: 'hotdog',
    img: '/images/hotdog.png'
  },
  {
    name: 'fries',
    img: '/images/fries.png'
  },
  {
    name: 'cheeseburger',
    img: '/images/cheeseburger.png'
  },
  {
    name: 'ice-cream',
    img: '/images/ice-cream.png'
  },
  {
    name: 'pizza',
    img: '/images/pizza.png'
  },
  {
    name: 'milkshake',
    img: '/images/milkshake.png'
  },
  {
    name: 'hotdog',
    img: '/images/hotdog.png'
  }
]

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
    this.setState({cardArray: CARD_ARRAY.sort(() => 0.5 - Math.random()).slice(0, 9)})
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    console.log("account", accounts[0])
    this.setState({account: accounts[0]})

    //load smart contract
    const networkId = await web3.eth.net.getId()
    console.log(networkId)
    const networkData = MemoryToken.networks[networkId]

    if (networkData) {
      const abi = MemoryToken.abi
      const address = networkData.address
      const token = new web3.eth.Contract(abi, address)
      this.setState({token})
      const totalSupply = await token.methods.totalSupply().call()
      this.setState({totalSupply})

      //load tokens
      let balanceOf = await token.methods.balanceOf(accounts[0]).call()

      for (let i = 0; i < balanceOf; i++) {
        let id = await token.methods.tokenOfOwnerByIndex(accounts[0], i).call()
        let tokenURI = await token.methods.tokenURI(id).call()
        this.setState({
          tokenURIs: [...this.state.tokenURIs, tokenURI]
        })
      }
    }
    else {
      alert('Smart contract not deployed to detected network')
    }
  }

  chooseImage = (cardId) => {
    cardId = cardId.toString()

    if (this.state.cardsWon.includes(cardId)) {
      return window.location.origin + '/images/white.png'
    }
    else if (this.state.cardsChosenId.includes(cardId)) {
      return CARD_ARRAY[cardId].img
    }
    else {
      return window.location.origin + '/images/blank.png'
    }
  }

  flipCard = async (cardId) => {
    this.setState({
      cardsChosen: [...this.state.cardsChosen, this.state.cardArray[cardId].name],
      cardsChosenId: [...this.state.cardsChosenId, cardId]
    })

    if (this.state.cardsChosen.length == this.state.cardArray.length - 1) {
      setTimeout(this.checkForThree, 100)
    }
  }

  checkForThree = async() => {
    let alreadyChosen = this.state.cardsChosen.slice().sort()

    for (let i = 0; i < alreadyChosen.length; i++) {
      if (alreadyChosen[i] == alreadyChosen[i + 1] && i < alreadyChosen.length - 1) {
        if(alreadyChosen[i] == alreadyChosen[i + 2] && i < alreadyChosen.length - 2) {
          this.setState({cardsWon: [...this.state.cardsWon, alreadyChosen[i]]})
        }
        else {
          i++
        }
      }
    }

    console.log(this.state.cardsWon)

    if (this.state.cardsWon.length > 0) {
      alert("Congratulations!! You can mint!")

      for (let i = 0; i < this.state.cardsWon.length; i++) {
        this.state.token.methods.mint(
          this.state.account,
          window.location.origin + CARD_ARRAY.find(e => e.name == this.state.cardsWon[i]).img.toString()
        )
        .send({from: this.state.account})
        .on('transactionHash', (hash) => {
          this.setState({
            tokenURIs: [...this.state.tokenURIs, CARD_ARRAY.find(e => e.name == this.state.cardsWon[i]).img]
          })
        })
      }
    }
    else {
      alert("Sorry, refresh to try again")
    }
  }

  // necessary?
  // handleBoardInteraction = (event) => {
  //   console.log("in handle board fucntoin")
  //   if (event.type === 'mousedown') {
  //     console.log("mouse was pressed")
  //     this.handleFlipOne(event)
  //   }
  //   if (event.type === 'keydown' && event.key === 'Enter') {
  //     console.log("enter was pressed")
  //     this.handleFlipAll(event)
  //   }
  //   else if (event.type === 'mousedown') {
  //     console.log("mouse was pressed")
  //     this.handleFlipOne(event)
  //   }
  //   else{
  //     console.log("else statement")
  //   }
  // }

  handleFlipOne = (event) => {
    let cardId = event.target.getAttribute('data-id')
    if (!this.state.cardsChosenId.includes(cardId.toString())) {
      this.flipCard(cardId)
    }
  }

  handleFlipAll = (event) => {
    for (let i = 0; i < this.state.cardArray; i++) {
      this.handleFlipOne(event)
    }
  }



  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      token: null,
      totalSupply: 0,
      tokenURIs: [],
      cardArray: [],
      cardsChosen: [],
      cardsChosenId: [],
      cardsWon: []
    }
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href=""
            target="_blank"
            rel="noopener noreferrer"
          >
          <img src={ticket} width="30" height="30" className="d-inline-block align-top" alt="" />
          &nbsp; NFT Scratcher
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-muted"><span id="account">{this.state.account}</span></small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1 className="d-4">Find 3 of the same to mint</h1>

                <div className="grid mb-4" >

                    {this.state.cardArray.map((card, key) => {
                      return(
                        <img
                          key={key}
                          src={this.chooseImage(key)}
                          data-id={key}
                          // onKeyDown={(e) => this.handleBoardInteraction(e)}
                          // onClick={this.handleBoardInteraction}
                          
                          onClick={(event) => {
                            let cardId = event.target.getAttribute('data-id')
                            if (!this.state.cardsChosenId.includes(cardId.toString())) {
                              this.flipCard(cardId)
                            }
                          }}
                        />
                      )
                    })}

                </div>

                <div>

                  <h5>Tokens Collected:<span id="result">&nbsp;{this.state.tokenURIs.length}</span></h5>

                  <div className="grid mb-4" >

                    { this.state.tokenURIs.map((tokenURI, key) => {
                      return(
                        <img
                          key={key}
                          src={tokenURI}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;