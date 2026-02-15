import { motion } from 'framer-motion';
import TagsHeader from './TagsHeader';
import TagsTable from './TagsTable';

const pageVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

/**
 * The Tags page.
 */
function Tags() {
  return (
    <motion.div
      className="w-full min-h-full"
      variants={pageVariants}
      initial="hidden"
      animate="show"
    >
      <TagsHeader />
      <TagsTable />
    </motion.div>
  );
}

export default Tags;
