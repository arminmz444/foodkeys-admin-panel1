import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple/FusePageSimple.jsx';
import DynamicFieldGenerator from 'app/shared-components/dynamic-field-generator/DynamicFieldGenerator.jsx';
import useThemeMediaQuery from '../../../../../@fuse/hooks/useThemeMediaQuery.js';

const Root = styled(FusePageSimple)(() => ({
	'& .FusePageCarded-header': {},
	'& .FusePageCarded-sidebar': {},
	'& .FusePageCarded-leftSidebar': {}
}));

/**
 * The Create Service Schema Form.
 */
function CreateServiceSchemaForm() {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const onSubmit = (e) => {
		alert(`Your service schema is :\n\n ${JSON.stringify(e)}\n`);
	};
	return (
		<Root
			content={
				<div className="flex-auto p-12 md:p-32 lg:p-48">
					<DynamicFieldGenerator
						initialValue={{}}
						onSubmit={onSubmit}
					/>
				</div>
			}
			scroll={isMobile ? 'normal' : 'content'}
		/>
	);
}

export default CreateServiceSchemaForm;
