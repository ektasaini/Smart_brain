import React, { Component } from 'react';
import Navigation from './Components/Navigation/Navigation';
import Clarifai from 'clarifai';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Logo from './Components/Logo/Logo';
import Rank from './Components/Rank/Rank';
import SignIn from './Components/SignIn/SignIn';
import Register from './Components/Register/Register';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import Particles from 'react-particles-js';
import './App.css';

const app = new Clarifai.App({
 apiKey: '1efa004a36e2406e973ed03048649365'
});

const particlesOptions = {
  particles: {
    number: {
      value: 200,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}



class App extends Component {
//we will set a state so as to remember everytime its changed //for that we need a constructor
  constructor(){
    super();
    this.state={
      input:'',
      imageUrl:'',
      box:{},
      route:'SignIn',
      //it see where we are on the page
      isSignedIn:false,
      user:{
        id:'',
        name:'',
        email:'',
        enteries:0,
        joined :''
      }
    }
  }


  loadUser=(data)=>{

    this.setState({user:{
      id:data.id,
      name:data.name,
      email:data.email,
      enteries:data.enteries,
      joined:data.joined
   } })
  }

  /*connecting frontend to backend using fetch*/

  /*/ componentDidMount(){
  //   fetch('http://localhost:3000/')
  //   .then (response=> response.json())
  //   .then (data=>console.log(data))
  // }*/



calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    

    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
    
  }


/* with a constructor we will have an on change event//and pass this as a prop for the image link form*/

displayFaceBox = (box) => {
  console.log(box);
    this.setState({box: box});
  }

  onInputChange=(event)=>{
    this.setState({input: event.target.value});
  }

onButtonsubmit=()=>{
this.setState({imageUrl: this.state.input});
app.models
.predict(
  Clarifai.FACE_DETECT_MODEL,
  this.state.input)
   .then(response=>{
    if (response){
      fetch('http://localhost:3000/image',{
        method:'put',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          id:this.state.user.id
        })
      })
      .then(response=>response.json())
      .then(count=>{
        this.setState(Object.assign(this.state.user,{enteries:count}))
      })
    }
    this.displayFaceBox(this.calculateFaceLocation(response))
   })

   .catch(err=>console.log(err));
     
}


 onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState({isSignedIn:false})
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }


  render() {
    return (
      <div className="App">
      <Particles  className='particles'
              params={particlesOptions}
            />
       <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
       { this.state.route ==='home'
        ?
         
        <div><Logo/>
         <Rank name={this.state.user.name} enteries={this.state.user.enteries}/>
       < ImageLinkForm onInputChange={this.onInputChange} onButtonsubmit={this.onButtonsubmit}/> 
       {/*oninputchange is a property of the class so to use this we have to use 'this' here*/}
       
         
        <FaceRecognition box ={ this.state.box}  imageUrl={this.state.imageUrl}/>
        </div>
       
       :(this.state.route==='SignIn'
        ?<SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        :<Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        )
       }
      </div>
    );
  }
}

export default App;
