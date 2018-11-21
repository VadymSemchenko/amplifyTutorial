import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, TextInput, Button} from 'react-native';
import Config from 'react-native-config';
import Amplify from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react-native';
import { Auth } from 'aws-amplify';
import { API, graphqlOperation } from 'aws-amplify';

import config from './aws-exports';
Amplify.configure(config);

const ListPets = `
  query {
    listPets {
      items {
        id
        name
        description
      }
    }
  }
`;

const CreatePet = `
  mutation($name: String!, $description: String) {
    createPet(input: {
      name: $name, description: $description
    }) {
      id
      name
      description
    }
  }
`;

const SubscribeToNewPets = `subscription {
  onCreatePet {
    id
    name
    description
  }
}`;

class App extends Component{

  state = {
    username: '',
    password: '',
    email: '',
    phone_number: '',
    pets: [],
    name: '',
    description: ''
  };

  onChangeText = (key, value) => {
    this.setState({ [key]: value })
  };

  createPet = async() => {
    const { name, description } = this.state
    if (name === '') return
    let pet = { name }
    if (description !== '') {
      pet = { ...pet, description }
    }
    const updatedPetArray = [...this.state.pets, pet]
    this.setState({ pets: updatedPetArray })
    try {
      await API.graphql(graphqlOperation(CreatePet, pet))
      console.log('item created!')
    } catch (err) {
      console.log('error creating pet...', err)
    }
  };

  async componentDidMount() {
    try {
      const pets = await API.graphql(graphqlOperation(ListPets))
      console.log('pets:', pets)
      this.setState({
        pets: pets.data.listPets.items
      })
    } catch (err) {
      console.log('error fetching pets...', err)
    };
    API.graphql(
      graphqlOperation(SubscribeToNewPets)
    ).subscribe({
        next: (eventData) => {
          console.log('eventData', eventData)
          const pet = eventData.value.data.onCreatePet
          const pets = [
            ...this.state.pets.filter(p => {
              const val1 = p.name + p.description
              const val2 = pet.name + pet.description
              return val1 !== val2
            }),
            pet
          ]
          this.setState({ pets })
        }
    });
  };

  signUp = async() => {
    const { username, password, email, phone_number } = this.state;
    try {
      await Auth.signUp({ username, password, attributes: { email, phone_number }})
    } catch (err) {
      console.log('error signing up user...', err);
    }
  }

  signOut = async () => {
    await Auth.signOut()
    this.props.rerender()
  };


  render() {
    return (
      <View style={styles.container}>
        <TextInput
          placeholder='username'
          value={this.state.username}
          style={{ width: 300, height: 50, margin: 5, backgroundColor: "#ddd" }}
          onChangeText={v => this.onChange('username', v)}
        />
          <TextInput
            placeholder='password'
            value={this.state.username}
            style={{ width: 300, height: 50, margin: 5, backgroundColor: "#ddd" }}
            onChangeText={v => this.onChange('password', v)}
          />
          <TextInput
            placeholder='email'
            value={this.state.username}
            style={{ width: 300, height: 50, margin: 5, backgroundColor: "#ddd" }}
            onChangeText={v => this.onChange('email', v)}
          />
          <TextInput
            placeholder='phone_number'
            value={this.state.username}
            style={{ width: 300, height: 50, margin: 5, backgroundColor: "#ddd" }}
            onChangeText={v => this.onChange('phone_number', v)}
          />
            {
            this.state.pets.map((pet, index) => (
              <View key={index}>
                <Text>{pet.name}</Text>
                <Text>{pet.description}</Text>
              </View>
            ))
          }
          <TextInput
            onChangeText={v => this.onChangeText('name', v)}
            value={this.state.name}
            style={{ width: 300, height: 50, margin: 5, backgroundColor: "#ddd" }}
          />
          <TextInput
            style={{ width: 300, height: 50, margin: 5, backgroundColor: "#ddd" }}
            onChangeText={v => this.onChangeText('description', v)}
            value={this.state.description}
          />
        <Button onPress={this.createPet} title='Create Pet' />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

// export default withAuthenticator(App);

export default props =>  {
  const AppComponent = withAuthenticator(App)
  return <AppComponent {...props} />
};