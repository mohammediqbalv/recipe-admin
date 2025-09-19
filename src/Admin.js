import React, { useState, useEffect } from 'react';
import './Admin.css';
import { BASE_URL } from './Services/baseURL';

// Users will be fetched from backend.
// Recipes will be fetched from backend

function Admin() {
    const [users, setUsers] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [reports, setReports] = useState([]); // Changed from messages to reports
    const [expandedDescriptions, setExpandedDescriptions] = useState(new Set()); // Track expanded descriptions
    // Modal state
    const [confirmModal, setConfirmModal] = useState({ open: false, type: '', id: null });

    // Toggle description expansion
    const toggleDescription = (recipeId) => {
        const newExpanded = new Set(expandedDescriptions);
        if (newExpanded.has(recipeId)) {
            newExpanded.delete(recipeId);
        } else {
            newExpanded.add(recipeId);
        }
        setExpandedDescriptions(newExpanded);
    };

    // Truncate text function
    const truncateText = (text, maxLength = 50) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    useEffect(() => {
        // Fetch users
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:4000/admin/user/all', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) throw new Error('Failed to fetch users');
                const data = await response.json();
                // Map user data to required fields
                const mapped = data.map(user => ({
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    profilePhoto: user.profile || 'https://randomuser.me/api/portraits/lego/1.jpg',
                }));
                setUsers(mapped);
            } catch (err) {
                setUsers([]);
            }
        };

        // Fetch recipes
        const fetchRecipes = async () => {
            try {
                const response = await fetch('http://localhost:4000/admin/posts/all', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) throw new Error('Failed to fetch recipes');
                const data = await response.json();
                const mapped = data.map(recipe => ({
                    id: recipe._id,
                    photo: recipe.recipeImage,
                    name: recipe.recipename,
                    description: recipe.make,
                    likes: recipe.likes ? recipe.likes.length : 0,
                }));
                setRecipes(mapped);
            } catch (err) {
                setRecipes([]);
            }
        };

        // Fetch reports from backend
        const fetchReports = async () => {
            try {
                const response = await fetch('http://localhost:4000/admin/reports', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) throw new Error('Failed to fetch reports');
                const data = await response.json();
                console.log('Reports fetched:', data);
                setReports(data);
            } catch (err) {
                console.log('Error fetching reports:', err);
                setReports([]);
            }
        };

        fetchUsers();
        fetchRecipes();
        fetchReports();
    }, []);

    // Open modal for user or recipe
    const openDeleteModal = (type, id) => {
        setConfirmModal({ open: true, type, id });
    };
    // Close modal
    const closeDeleteModal = () => {
        setConfirmModal({ open: false, type: '', id: null });
    };
    // Confirm deletion
    const confirmDelete = async () => {
        if (confirmModal.type === 'user') {
            try {
                const response = await fetch(`http://localhost:4000/admin/user/delete/${confirmModal.id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                });
                if (!response.ok) throw new Error('Failed to delete user');
                setUsers(users.filter(user => user.id !== confirmModal.id));
            } catch (err) {
                alert('Failed to delete user.');
            }
        } else if (confirmModal.type === 'recipe') {
            try {
                const response = await fetch(`http://localhost:4000/admin/posts/delete/${confirmModal.id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                });
                if (!response.ok) throw new Error('Failed to delete recipe');
                setRecipes(recipes.filter(recipe => recipe.id !== confirmModal.id));
                // Also remove reports for this deleted post
                setReports(reports.filter(report => report.postId?._id !== confirmModal.id));
            } catch (err) {
                alert('Failed to delete recipe.');
            }
        }
        closeDeleteModal();
    };

    // Handle report dismissal (remove report without deleting post)
    const dismissReport = async (reportId) => {
        try {
            const response = await fetch(`http://localhost:4000/admin/reports/${reportId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error('Failed to dismiss report');
            setReports(reports.filter(report => report._id !== reportId));
        } catch (err) {
            alert('Failed to dismiss report.');
        }
    };

    return (
        <div className="admin-container">
            {/* Food-themed confirmation modal */}
            {confirmModal.open && (
                <div className="food-modal-overlay">
                    <div className="food-modal">
                        <div className="food-modal-emoji">🍕🍔🍟</div>
                        <div className="food-modal-title">Are you sure?</div>
                        <div className="food-modal-text">
                            {confirmModal.type === 'user' ? 'Do you want to delete this user?' : 'Do you want to delete this recipe?'}
                        </div>
                        <div className="food-modal-actions">
                            <button className="food-btn food-btn-confirm" onClick={confirmDelete}>Yes, Delete</button>
                            <button className="food-btn food-btn-cancel" onClick={closeDeleteModal}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            <h2>Admin Dashboard</h2>

            {/* Reports Section */}
            <div className="admin-section">
                <h3>🚨 Post Reports</h3>
                {reports.length === 0 ? (
                    <div className="no-reports">
                        <p>No reports found. All posts are following community guidelines! 🎉</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Post Name</th>
                                <th>Reported By</th>
                                <th>Reason</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map(report => (
                                <tr key={report._id}>
                                    <td>{report.postId?.recipename || 'Post not found'}</td>
                                    <td>{report.reportedBy?.username || 'Unknown user'}</td>
                                    <td>{report.reason}</td>
                                    <td>{new Date(report.createdAt).toLocaleString()}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                className="delete-btn" 
                                                onClick={() => openDeleteModal('recipe', report.postId?._id)}
                                                style={{ backgroundColor: '#ff4d4f' }}
                                            >
                                                Remove Post
                                            </button>
                                            <button 
                                                className="delete-btn" 
                                                onClick={() => dismissReport(report._id)}
                                                style={{ backgroundColor: '#52c41a' }}
                                            >
                                                Dismiss Report
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="admin-section">
                <h3>Users List</h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Profile Photo</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td><img src={`${BASE_URL}/uploads/${user.profilePhoto}`} alt={user.username} className="profile-photo" /></td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td><button className="delete-btn" onClick={() => openDeleteModal('user', user.id)}>Delete</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="admin-section">
                <h3>Recipes List</h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Media</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Likes</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recipes.map(recipe => (
                            <tr key={recipe.id}>
                                <td>
                                    {recipe.photo && (
                                        /\.(mp4|webm|ogg)$/i.test(recipe.photo) ? (
                                            <video
                                                src={`${BASE_URL}/uploads/${recipe.photo}`}
                                                className="recipe-photo"
                                                width={48}
                                                height={48}
                                                controls={false}
                                                muted
                                                preload="metadata"
                                                style={{ objectFit: 'cover', borderRadius: '50%' }}
                                                poster={`${BASE_URL}/uploads/${recipe.photo.replace(/\.(mp4|webm|ogg)$/i, '.jpg')}`}
                                            />
                                        ) : (
                                            <img
                                                src={`${BASE_URL}/uploads/${recipe.photo}`}
                                                alt={recipe.name}
                                                className="recipe-photo"
                                            />
                                        )
                                    )}
                                </td>
                                <td>{recipe.name}</td>
                                <td>
                                    {expandedDescriptions.has(recipe.id) ? (
                                        <span>{recipe.description}</span>
                                    ) : (
                                        <span>{truncateText(recipe.description)}</span>
                                    )}
                                    <button 
                                        className="view-more-btn" 
                                        onClick={() => toggleDescription(recipe.id)}
                                    >
                                        {expandedDescriptions.has(recipe.id) ? 'View Less' : 'View More'}
                                    </button>
                                </td>
                                <td>{recipe.likes}</td>
                                <td><button className="delete-btn" onClick={() => openDeleteModal('recipe', recipe.id)}>Delete</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Admin;
