type Course = {
  id: string;
  name: string;
  description: string;
};

export default function Posts({ courses }: { courses: Course[] }) {
    const displaytitle = (title: string) => {
    let displayTitle;
    for(let i = 0; i < title.length;i++){
      if (i == 0)
      {
        displayTitle = null;
        displayTitle = title.charAt(0).toUpperCase();
      }
      else
      {
        switch (title.charAt(i)) {
          case "_": displayTitle = displayTitle + " ";
                  break;
          default: if (title.charAt(i - 1) == "_") {displayTitle = displayTitle + title.charAt(i).toUpperCase();}
                  else {displayTitle = displayTitle + title.charAt(i);}
                  break; 
        }
        
      }
    }
    return displayTitle;
  }
    
    return (
    <div className="bg-white dark:bg-[#2F2F2F] w-15/16 min-h-[90vh] mx-auto mb-5 rounded-3xl">
        <div className="m-8 pt-5">
            <div className="relative inline-block">
                <select id="filter" name="filter" className="bg-white dark:bg-[#7B7B7B] h-10 w-50 px-3 rounded-lg hover:inset-shadow-2xs appearance-none">
                    <option value="recent">Recent</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <svg
                    className="w-3 h-3 fill-current text-[#818181] dark:text-white"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <polygon points="0,3 20,3 10,15" />
                    </svg>
                </div>
            </div>
            <div className="relative inline-block">
                <select id="courses" name="courses" className="bg-white dark:bg-[#7B7B7B] h-10 w-50 ml-5 px-3 rounded-lg hover:inset-shadow-2xs appearance-none">
                    <option value="Recently Posted">All Courses</option>
                    {courses.map((course) => (
                        <option
                            key={course.id}
                            value={course.id}
                        >
                        {displaytitle(course.name)}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <svg
                    className="w-3 h-3 fill-current text-[#818181] dark:text-white"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <polygon points="0,3 20,3 10,15" />
                    </svg>
                </div>
            </div>
        </div>
        
    </div>
    );
}
        