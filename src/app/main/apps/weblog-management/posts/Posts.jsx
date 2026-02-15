import { motion } from 'framer-motion';
import PostsHeader from './PostsHeader';
import PostsTable from './PostsTable';

const pageVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

/**
 * The Posts page.
 */
function Posts() {
  return (
    <motion.div
      className="flex flex-col w-full h-full"
      variants={pageVariants}
      initial="hidden"
      animate="show"
    >
      <PostsHeader />
      <PostsTable />
    </motion.div>
  );
}

export default Posts;
