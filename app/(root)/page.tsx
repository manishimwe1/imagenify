import { Collection } from "@/components/shared/Collection";
import { navLinks } from "@/constants";
import { getAllImage } from "@/lib/actions/image.actions";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default async function Home({
	searchParams,
}: SearchParamProps) {
	const page = Number(searchParams.page) || 1;
	const searquery = (searchParams?.query as string) || "";
	const Images = await getAllImage({ page, searquery });

	return (
		<>
			<section className='home'>
				<h1 className='home-heading'>
					Unleash Creative Vision with Imaginify
				</h1>
				<ul className='flex-center w-full gap-20'>
					{navLinks.slice(1, 5).map((link) => (
						<Link
							key={link.route}
							href={link.route}
							className='flex-center flex-col gap-2'>
							<li className='flex-center w-fit rounded-full bg-white p-4'>
								<Image
									src={link.icon}
									alt='image'
									width={24}
									height={24}
								/>
							</li>
							<p className='p-14-medium text-center text-white'>
								{link.label}
							</p>
						</Link>
					))}
				</ul>
			</section>
			<section className='sm:mt-12'>
				<Collection
					hasSearch={true}
					images={Images?.data}
					totalPages={Images?.totalPage}
					page={page}
				/>
			</section>
		</>
	);
}
