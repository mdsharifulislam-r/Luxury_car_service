function extractDateAndTime(isoString: string) {
    const dateObj = new Date(isoString);
  
    // Date: "Oct 12, 2023"
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    const date = dateObj.toLocaleDateString('en-US', dateOptions);
  
    // Time: "8:19 AM"
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };
    const time = dateObj.toLocaleTimeString('en-US', timeOptions);
  
    return { date, time };
  }
  function timeAgo(fromDate:any) {
    const now:any = new Date();
    const from:any = new Date(fromDate);
    const diff = Math.abs(now - from);
  
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
  
    if (seconds < 60) return `${seconds} sec`;
    if (minutes < 60) return `${minutes} min `;
    if (hours < 24) return `${hours} hr`;
    return `${days} days ago`;
  }
export const timeHelper = {
    extractDateAndTime,
    timeAgo
}  