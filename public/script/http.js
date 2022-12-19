export const get = async function (url) {
    return await fetch(url)
        .then((res) => res.json())
        .catch((err) => console.warn(err));
};
export const post = async function (url, data) {
    return await fetch(url, {
        method: 'POST', headers: {
            'Content-Type': 'application/json'
        }, body: JSON.stringify(data)
    })
        .then((res) => res.json())
        .catch((err) => console.warn(err));
};