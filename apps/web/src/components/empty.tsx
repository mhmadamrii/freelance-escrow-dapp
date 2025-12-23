import { Link } from '@tanstack/react-router';

export function Empty() {
  return (
    <div className='h-screen flex-col flex items-center justify-center'>
      <h1>You need to login</h1>
      <Link to='/auth' className='underline'>
        Click here
      </Link>
    </div>
  );
}
