import Dashboard from './pages/Dashboard';
import GlobalAccess from './pages/GlobalAccess';
import ProjectChecklist from './pages/ProjectChecklist';
import PublicTaskForm from './pages/PublicTaskForm';
import SharedAccess from './pages/SharedAccess';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "GlobalAccess": GlobalAccess,
    "ProjectChecklist": ProjectChecklist,
    "PublicTaskForm": PublicTaskForm,
    "SharedAccess": SharedAccess,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};