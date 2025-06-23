import {JSX} from 'react';

/**
 * Layout component for the /profile route and its subroutes.
 *
 * Wraps the profile-related pages with a fragment. Can be extended with
 * additional layout elements such as navigation, sidebars, or context providers.
 *
 * @param {Readonly<{ children: React.ReactNode }>} props - The nested route components to render inside this layout.
 * @returns {JSX.Element} The rendered layout content.
 */
export default async function ProfileLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>): Promise<JSX.Element> {
	return (
		<>
			{children}
		</>
	);
}
