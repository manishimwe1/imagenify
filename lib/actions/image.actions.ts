"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../databases/mongoose";
import { handleError } from "../utils";
import User from "../databases/models/user.model";
import Image from "../databases/models/image.model";
import { redirect } from "next/navigation";
import { v2 as cloudinary } from "cloudinary";
const populateUser = (query: any) =>
	query.populate({
		path: "author",
		model: User,
		select: "_id firstName lastName",
	});

//add image

export async function addImage({
	image,
	userId,
	path,
}: AddImageParams) {
	try {
		await connectToDatabase();

		const author = await User.findById(userId);

		if (!author) {
			throw new Error("User not found");
		}

		const newImage = await Image.create({
			...image,
			author: author._id,
		});

		revalidatePath(path);
		return JSON.parse(JSON.stringify(newImage));
	} catch (error) {
		handleError(error);
	}
}
export async function UpdateImage({
	image,
	userId,
	path,
}: UpdateImageParams) {
	try {
		await connectToDatabase();

		const imageToUpdate = await Image.findById(
			image._id,
		);

		if (
			!imageToUpdate ||
			imageToUpdate.author.toHexString() !== userId
		) {
			throw new Error("Unauthorized Image not found");
		}

		const UpdatedImage = await Image.findByIdAndUpdate(
			imageToUpdate._id,
			image,
			{ new: true },
		);
		revalidatePath(path);
		return JSON.parse(JSON.stringify(UpdatedImage));
	} catch (error) {
		handleError(error);
	}
}
export async function deleteImage(imageId: string) {
	try {
		await connectToDatabase();
		await Image.findByIdAndDelete(imageId);
	} catch (error) {
		handleError(error);
	} finally {
		redirect("/");
	}
}
export async function getImageById(imageId: string) {
	try {
		await connectToDatabase();

		const image = await populateUser(
			Image.findById(imageId),
		);
		if (!image) {
			throw new Error("Image not found");
		}
		return JSON.parse(JSON.stringify(image));
	} catch (error) {
		handleError(error);
	}
}

export async function getAllImage({
	limit = 9,
	page = 1,
	searquery = "",
}: {
	limit?: number;
	page: number;
	searquery: string;
}) {
	try {
		await connectToDatabase();
		cloudinary.config({
			cloud_name:
				process.env
					.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET,
			secure: true,
		});
		let expression = "folder=Imagenify";
		if (searquery) {
			expression += ` AND ${searquery}`;
		}

		const { resources } = await cloudinary.search
			.expression(expression)
			.execute();

		const resourceIds = resources.map(
			(resource: any) => resource.public_id,
		);

		let query = {};
		if (searquery) {
			query = {
				publicId: {
					$in: resourceIds,
				},
			};
		}
		const skipAmount = (Number(page) - 1) * limit;

		const images = await populateUser(
			Image.find(query)
				.sort({ updatedAt: -1 })
				.skip(skipAmount)
				.limit(limit),
		);

		const totalImages = await Image.find(
			query,
		).countDocuments();
		const savedImages =
			await Image.find().countDocuments();

		return {
			data: JSON.parse(JSON.stringify(images)),
			totalPage: Math.ceil(totalImages / limit),
			savedImages,
		};
	} catch (error) {
		handleError(error);
	}
}
