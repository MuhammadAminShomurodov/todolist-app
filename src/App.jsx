import React, { Component } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  FormControl,
  InputGroup,
  Col,
  Row,
} from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      showModal: false,
      isEditing: false,
      currentUserId: null,
      formData: {
        id: "",
        name: "",
        username: "",
        email: "",
      },
      searchTerm: "",
      isLoading: false,
    };
  }

  componentDidMount() {
    this.fetchUsers();
  }

  fetchUsers = async () => {
    try {
      const response = await axios.get(
        "https://jsonplaceholder.typicode.com/users"
      );
      const users = response.data || [];
      this.setState({ users });
      this.updateLocalStorage(users); // Lokal saqlashni yangilash
    } catch (error) {
      console.error("Error fetching users from API:", error);
      toast.error("Failed to fetch users from API.");
    }
  };

  updateLocalStorage = (users) => {
    localStorage.setItem("users", JSON.stringify(users));
  };

  handleFormSubmit = async (e) => {
    e.preventDefault();
    const { isEditing, currentUserId, formData, users } = this.state;

    try {
      let response;
      if (isEditing) {
        response = await axios.put(
          `https://jsonplaceholder.typicode.com/users/${currentUserId}`,
          formData
        );
        const updatedUsers = users.map((user) =>
          user.id === currentUserId ? response.data : user
        );
        this.setState({
          users: updatedUsers,
          isEditing: false,
          showModal: false,
          formData: { id: "", name: "", username: "", email: "" },
        });
        this.updateLocalStorage(updatedUsers); // Lokal saqlashni yangilash
        toast.success("User updated successfully!");
      } else {
        const newUser = {
          ...formData,
          id: uuidv4(),
        };

        response = await axios.post(
          "https://jsonplaceholder.typicode.com/users",
          newUser
        );
        const updatedUsers = [...users, response.data];
        this.setState({
          users: updatedUsers,
          showModal: false,
          formData: { id: "", name: "", username: "", email: "" },
        });
        this.updateLocalStorage(updatedUsers); // Lokal saqlashni yangilash
        toast.success("User added successfully!");
      }
    } catch (error) {
      console.error("Error adding/updating user:", error);
      toast.error(`Failed to ${isEditing ? "update" : "add"} user.`);
    }
  };

  handleEdit = (user) => {
    this.setState({
      formData: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
      currentUserId: user.id,
      isEditing: true,
      showModal: true,
    });
  };

  handleDelete = async (id) => {
    try {
      await axios.delete(`https://jsonplaceholder.typicode.com/users/${id}`);
      const { users } = this.state;
      const updatedUsers = users.filter((user) => user.id !== id);
      this.setState({ users: updatedUsers });
      this.updateLocalStorage(updatedUsers); // Lokal saqlashni yangilash
      toast.error("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user.");
    }
  };

  handleSearch = (e) => {
    this.setState({ searchTerm: e.target.value });
  };

  render() {
    const { users, showModal, isEditing, formData, searchTerm, isLoading } =
      this.state;

    const filteredUsers = users.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="container mt-4">
        <ToastContainer />
        <div className="btns-search">
          <Row className="mt-3">
            <Col>
              <InputGroup>
                <FormControl
                  placeholder="Search by name"
                  value={searchTerm}
                  onChange={this.handleSearch}
                />
              </InputGroup>
            </Col>
          </Row>
          <Button
            variant="primary"
            onClick={() => this.setState({ showModal: true })}
            className="add mt-3"
          >
            {isLoading ? (
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            ) : (
              "Add User"
            )}
          </Button>
        </div>
        <Table striped bordered hover className="mt-4">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <Button
                    variant="warning"
                    onClick={() => this.handleEdit(user)}
                    className="edit-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Spinner animation="border" size="sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    ) : (
                      "Edit"
                    )}
                  </Button>{" "}
                  <Button
                    variant="danger"
                    onClick={() => this.handleDelete(user.id)}
                    className="delete-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Spinner animation="border" size="sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal
          show={showModal}
          onHide={() => this.setState({ showModal: false })}
        >
          <Modal.Header closeButton>
            <Modal.Title>{isEditing ? "Edit User" : "Add User"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.handleFormSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    this.setState({
                      formData: { ...formData, name: e.target.value },
                    })
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    this.setState({
                      formData: { ...formData, username: e.target.value },
                    })
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    this.setState({
                      formData: { ...formData, email: e.target.value },
                    })
                  }
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                {isLoading ? "Loading..." : isEditing ? "Update" : "Add"}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default App;
