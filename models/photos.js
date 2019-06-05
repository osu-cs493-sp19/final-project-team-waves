const { extractValidFields } = require("../lib/validation");
const { getDBRef, createObjectId } = require("../lib/mongo");

const photoSchema = {
    userId: { required: true },
    businessId: { required: true },
    caption: { required: false }
};

const PHOTOS_COLLECTION_NAME = "photos";

function getPhotosCollection() {
    return getDBRef().collection(PHOTOS_COLLECTION_NAME);
}

async function getPhotoById(id) {
    const collection = getPhotosCollection();

    const photo = await collection.findOne({
        _id: createObjectId(id)
    });

    return photo;
}

async function getPhotosByBusinessId(businessId) {
    const collection = getPhotosCollection();

    const photos = await collection.find({
        businessId: businessId
    }).toArray();

    return photos;
}

async function getPhotosByUserId(userId) {
    const collection = getPhotosCollection();

    const photos = await collection.find({
        userId: userId
    }).toArray();

    return photos;
}

async function insertNewPhoto(photo) {
    const photoToInsert = extractValidFields(photo, photoSchema);
    const collection = getPhotosCollection();
    const result = await collection.insertOne(photoToInsert);

    return result.insertedId;
}

async function updatePhotoById(id, photo) {
    const photoValues = extractValidFields(photo, photoSchema);
    const collection = getPhotosCollection();
    
    const result = await collection.replaceOne(
        { _id: createObjectId(id) },
        photoValues
    );

    return result.matchedCount > 0;
}

async function deletePhotoById(id) {
    const collection = getPhotosCollection();
    
    const result = await collection.deleteOne({
        _id: createObjectId(id)
    });

    return result.deletedCount > 0;
}

module.exports = {
    photoSchema,
    getPhotoById,
    getPhotosByBusinessId,
    getPhotosByUserId,
    insertNewPhoto,
    updatePhotoById,
    deletePhotoById
};
