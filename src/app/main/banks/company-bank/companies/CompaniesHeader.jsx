import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useGetCategoryOptionsQuery } from 'src/app/main/category/CategoriesApi';

/**
 * The generic companies header.
 *
 * Reads the current `categoryId` from the route and shows the matching
 * category label (looked up from the cached `/category/options` response).
 */
function CompaniesHeader() {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const { categoryId } = useParams();

	const { data } = useGetCategoryOptionsQuery({
		pageNumber: 1,
		pageSize: 1000,
		search: '',
		sort: '',
		filter: ''
	});

	const categoryLabel =
		data?.data?.find((option) => String(option.value) === String(categoryId))?.label || '';

	return (
		<div className="flex space-y-12 sm:space-y-0 flex-1 w-full items-center justify-between py-8 sm:py-16 px-16 md:px-24">
			<motion.span
				initial={{ x: -20 }}
				animate={{ x: 0, transition: { delay: 0.2 } }}
			>
				<Typography className="text-24 md:text-32 font-extrabold tracking-tight">
					{categoryLabel ? `لیست شرکت‌های ${categoryLabel}` : 'لیست شرکت‌ها'}
				</Typography>
			</motion.span>

			<div className="flex flex-1 items-center justify-end space-x-8">
				<motion.div
					className="flex flex-grow-0"
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
				>
					<Button
						className=""
						variant="contained"
						color="secondary"
						component={NavLinkAdapter}
						to={`/banks/${categoryId}/company/new`}
						size={isMobile ? 'small' : 'medium'}
					>
						<FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>
						<span className="mx-4 sm:mx-8">ثبت شرکت جدید</span>
					</Button>
				</motion.div>
			</div>
		</div>
	);
}

export default CompaniesHeader;
