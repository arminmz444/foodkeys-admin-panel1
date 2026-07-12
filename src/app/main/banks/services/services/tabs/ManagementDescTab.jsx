import { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { CircularProgress, Alert, Snackbar } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import RecordsTimeline from 'src/app/main/banks/food-industry-bank/company/tabs/components/records-timeline/RecordsTimeline';
import EditorJSComponent from 'app/shared-components/editor-js/EditorJSComponent';
import {
	useGetEmployeeCommentsByEntityQuery,
	useAddEmployeeCommentMutation,
	useUpdateEmployeeCommentMutation,
	useDeleteEmployeeCommentMutation
} from 'src/app/main/banks/food-industry-bank/FoodIndustryBankApi';
import { selectUser, selectUserRole } from 'src/app/auth/user/store/userSlice';

function ManagementDescTab({ isDraft = false }) {
	const { control } = useFormContext();
	const { id: serviceId } = useParams();
	const isSavedService = Boolean(serviceId) && !isDraft && serviceId !== 'new';

	const user = useSelector(selectUser);
	const userRole = useSelector(selectUserRole);

	const userRoles = user?.roles
		? Array.isArray(user.roles)
			? user.roles.map((role) => (typeof role === 'object' ? role.name : role))
			: [user.roles]
		: [];

	if (userRole && !userRoles.includes(userRole)) {
		userRoles.push(userRole);
	}

	const [editorLoading, setEditorLoading] = useState(false);
	const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
	const [currentPageNumber, setCurrentPageNumber] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const pageSize = 10;

	const {
		data: commentsData,
		isLoading: isLoadingComments,
		refetch: refetchComments
	} = useGetEmployeeCommentsByEntityQuery(
		{
			entityType: 'Service',
			entityId: serviceId,
			pageNumber: currentPageNumber,
			pageSize
		},
		{ skip: !isSavedService }
	);

	const [addComment, { isLoading: isAddingComment }] = useAddEmployeeCommentMutation();
	const [updateComment] = useUpdateEmployeeCommentMutation();
	const [deleteComment] = useDeleteEmployeeCommentMutation();

	const [comments, setComments] = useState([]);
	const hasMore = currentPageNumber < totalPages;

	useEffect(() => {
		if (commentsData) {
			const newComments = commentsData.data || [];
			setTotalPages(commentsData.pagination?.totalPages || 1);

			if (currentPageNumber === 1) {
				setComments(newComments);
			} else {
				setComments((prev) => [...prev, ...newComments]);
			}
		}
	}, [commentsData, currentPageNumber]);

	const handleLoadMore = () => {
		if (hasMore) {
			setCurrentPageNumber((prev) => prev + 1);
		}
	};

	const handleAddComment = async (editorData) => {
		if (!isSavedService) return;

		setEditorLoading(true);
		try {
			await addComment({
				entityType: 'Service',
				entityId: serviceId,
				comment: JSON.stringify(editorData),
				isInternal: true,
				commentType: 'MANAGEMENT'
			}).unwrap();

			setCurrentPageNumber(1);
			await refetchComments();

			setNotification({
				open: true,
				message: 'نظر با موفقیت اضافه شد',
				severity: 'success'
			});
		} catch (error) {
			console.error('Error adding comment:', error);
			setNotification({
				open: true,
				message: 'خطا در ثبت نظر. لطفا مجددا تلاش کنید.',
				severity: 'error'
			});
		} finally {
			setEditorLoading(false);
		}
	};

	const handleEditComment = async (data) => {
		try {
			await updateComment({
				id: data.id,
				commentData: {
					entityType: 'Service',
					entityId: serviceId,
					comment:
						typeof data.commentData.comment === 'object'
							? JSON.stringify(data.commentData.comment)
							: data.commentData.comment,
					isInternal: data.commentData.isInternal !== false,
					commentType: data.commentData.commentType || 'MANAGEMENT'
				}
			}).unwrap();

			await refetchComments();

			setNotification({
				open: true,
				message: 'نظر با موفقیت ویرایش شد',
				severity: 'success'
			});
		} catch (error) {
			console.error('Error updating comment:', error);
			setNotification({
				open: true,
				message: 'خطا در ویرایش نظر. لطفا مجددا تلاش کنید.',
				severity: 'error'
			});
		}
	};

	const handleDeleteComment = async (commentId) => {
		try {
			await deleteComment(commentId).unwrap();
			await refetchComments();

			setNotification({
				open: true,
				message: 'نظر با موفقیت حذف شد',
				severity: 'success'
			});
		} catch (error) {
			console.error('Error deleting comment:', error);
			setNotification({
				open: true,
				message: 'خطا در حذف نظر. لطفا مجددا تلاش کنید.',
				severity: 'error'
			});
		}
	};

	const handleCloseNotification = () => {
		setNotification({ ...notification, open: false });
	};

	const editorComponent = (
		<EditorJSComponent
			onSave={handleAddComment}
			loading={editorLoading || isAddingComment}
			buttonText="ثبت نظر جدید"
			editorCardClassName="p-10"
		/>
	);

	return (
		<div>
			<Typography variant="h6" className="font-bold mt-16 mb-8">
				توضیحات مدیریت
			</Typography>
			<Controller
				name="adminComment"
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						value={field.value || ''}
						className="mt-8 mb-16 sm:mx-4"
						multiline
						minRows={5}
						label="توضیحات مدیریت"
						id="adminComment"
						variant="outlined"
						fullWidth
					/>
				)}
			/>

			<Divider className="my-24" />

			{!isSavedService ? (
				<Alert severity="info" className="mt-16">
					سوابق و رکوردهای این سرویس پس از ذخیره سرویس در دسترس خواهند بود.
				</Alert>
			) : (
				<>
					<Typography variant="h6" className="font-bold mt-16 mb-8">
						سوابق و رکوردهای این سرویس
					</Typography>

					{isLoadingComments && comments.length === 0 ? (
						<div className="flex justify-center my-32">
							<CircularProgress />
						</div>
					) : (
						<RecordsTimeline
							records={comments}
							loading={isLoadingComments}
							hasMore={hasMore}
							onLoadMore={handleLoadMore}
							onEditComment={handleEditComment}
							onDeleteComment={handleDeleteComment}
							editorComponent={editorComponent}
							classes={{ editorContainer: 'mt-10 mb-10' }}
							currentUserRoles={userRoles}
							entityType="Service"
							entityId={serviceId}
						/>
					)}
				</>
			)}

			<Snackbar
				open={notification.open}
				autoHideDuration={6000}
				onClose={handleCloseNotification}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				<Alert onClose={handleCloseNotification} severity={notification.severity} variant="filled">
					{notification.message}
				</Alert>
			</Snackbar>
		</div>
	);
}

export default ManagementDescTab;
