import _ from '@lodash';

/**
 * The NotificationModel class.
 * Implements NotificationModelProps interface.
 */
function NotificationModel(data) {
	const currentTime = new Date().toISOString();
    // Create a copy of the input data
    const dataCopy = data ? { ...data } : {};
	return _.defaults(dataCopy, {
		id: _.uniqueId(),
		icon: 'heroicons-solid:star',
		title: 'بدون عنوان',
		message: 'بدون پیام',
		description: 'بدون توضیحات',
		image: '',
		priority: 'LOW',
		sendTime: currentTime,
		timestamp: currentTime,
		read: false,
		variant: 'secondary',
		link: '/apps/notifications',
		useRouter: true,
		userId: 0,
	});
}

export default NotificationModel;
