const users = [
    {
        id: 1,
        name: 'John Doe',
        age: 25
    },
    {
        id: 2,
        name: 'Jane Doe',
        age: 24
    }
];

const getUser = (id) => {
    return users[id];
}

module.exports = {
    users,
    getUser
};