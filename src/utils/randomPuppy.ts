import axios from "axios";

export async function randomPuppy(random: string) {
	//Perform a GET request
	const { data } = await axios.get(`https://www.reddit.com/r/${random}.json?limit=150`, {
		headers: {
			"Content-Type": "application/json",
		},
	});
	const { children } = data.data;

	//Filter posts from those with no images
	const results = await Promise.allSettled(
		children.map((element: any) => {
			const { url_overridden_by_dest } = element.data;

			//Some posts doesn't include any image links
			if (url_overridden_by_dest != null || url_overridden_by_dest != undefined) {
				//Filter out empty links and those linked to a gallery
				if (
					url_overridden_by_dest.length > 0 &&
					!url_overridden_by_dest.includes("gallery") &&
					url_overridden_by_dest.includes("redd") &&
					url_overridden_by_dest.includes("png")
				) {
					return url_overridden_by_dest;
				}
			}
		})
	);

	//You can read more on Promises, we need an array from the results promise
	const images = [];
	const failed = [];

	for (const result of results) {
		if (result.status === "rejected") {
			failed.push(result.reason);
			continue;
		}
		if (result.value) {
			images.push(result.value);
		}
	}

	//Random image from the images links array
	const image = images[Math.floor(Math.random() * images.length)];

	return image;
}
