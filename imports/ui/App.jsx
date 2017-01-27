import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { Tasks } from '../api/tasks.js';

import Task from './Task.jsx';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';

class App extends Component {

  constructor(props){
    super(props);

    this.state = {
      hideCompleted: false,
    };
  }

  renderTasks(){
    let filteredTasks = this.props.tasks;
    if (this.state.hideCompleted){
      filteredTasks = filteredTasks.filter(t=>!t.checked);
    }
    return filteredTasks.map(task=>{
      return <Task key={task._id} task={task} />
    });
  }

  handleSubmit(e){
    e.preventDefault();

    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

    Tasks.insert({
      text,
      createdAt: new Date(),
      checked: false,
      owner: Meteor.userId(),
      username: Meteor.user().username,
    });

    ReactDOM.findDOMNode(this.refs.textInput).value = '';
  }

  toggleHideCompleted(){
    this.setState({
      hideCompleted: !this.state.hideCompleted
    })
  }

  render() {
    return (
      <div className="container">
        <header>
          <h1>Todo List ({this.props.incompleteCount} incomplete)</h1>
          <br></br>
          <label>
            <input
              type='checkbox'
              readOnly
              checked={this.state.hideCompleted}
              onClick={this.toggleHideCompleted.bind(this)}
            />
            Hide Completed Tasks
          </label>

          <AccountsUIWrapper />

          {this.props.currentUser ?
            <form className="new-task"
                  onSubmit={this.handleSubmit.bind(this)}>
              <input type='text'
                     ref='textInput'
                     placeholder='Type to add new tasks'
              />
          </form> : ''
          }
        </header>

        <ul>
          {this.renderTasks()}
        </ul>
      </div>
    );
  }
}

App.propTypes = {
  tasks: PropTypes.array.isRequired,
  incompleteCount: PropTypes.number.isRequired,
  currentUser: PropTypes.object,
};

export default createContainer(()=>{
  return {
    tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
    incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
    currentUser: Meteor.user(),
  };
}, App);
