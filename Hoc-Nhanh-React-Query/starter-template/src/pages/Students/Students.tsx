import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteStudent, getStudent, getStudents } from 'apis/students.api'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useQueryString } from 'utils/utils'

const LIMIT = 10
export default function Students() {
  // Query data by useEffect
  /*
  const [students, setStudents] = useState<StudentsType>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  useEffect(() => {
    setIsLoading(true)
    getStudents(1, 10)
      .then((res) => {
        setStudents(res.data)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])
  */

  // Query data by ReactQuery
  const queryString: { page?: string } = useQueryString()
  const queryClient = useQueryClient()
  const page = Number(queryString.page) || 1

  const { data, isLoading, isPreviousData, isFetching } = useQuery({
    queryKey: ['students', page],
    queryFn: () => getStudents(page, 10),
    keepPreviousData: true,
    staleTime: 3 * 60 * 1000
  })

  const totalStudentsCount = Number(data?.headers['x-total-count'] || 0)
  const totalPage = Math.ceil(totalStudentsCount / LIMIT)

  const deleteStudentMutation = useMutation({
    mutationFn: (id: number | string) => deleteStudent(id),
    onSuccess: (_, id) => {
      // Điều này có nghĩa là nó sẽ cập nhật lại dữ liệu cho trang "page", để cập nhật lại dữ liệu cho trang "page"
      // nó sẽ gọi đến queryFn của useQuery có queryKey: ['student', page]. Khi mà để "exact" thì cái queryKey phải chính xác với queryKey trong useQuery
      queryClient.invalidateQueries({ queryKey: ['students', page], exact: true })

      // Có thể chỉ để tiền tố 'students' khi này nó sẽ đi tìm những useQuery mà có key có tiền tố 'students'
      // queryClient.invalidateQueries({ queryKey: ['students']})

      toast.success('Student deleted successfully student id: ' + id)
    }
  })

  const handleDelete = (id: number) => {
    deleteStudentMutation.mutate(id)
  }

  // Sd de prefetching
  const handlePrefetchStudent = (id: number) => {
    queryClient.prefetchQuery(['student', String(id)], {
      queryFn: () => getStudent(id),
      // Tránh bị refetch lại nhiều lần trong khi hơ chuột
      staleTime: 10 * 1000
    })
  }

  return (
    <div>
      <h1 className='text-lg'>Students</h1>

      <div className='mt-6'>
        <Link
          to='/students/add'
          className=' rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 '
        >
          Add Student
        </Link>
      </div>
      {isLoading && (
        <div role='status' className='mt-6 animate-pulse'>
          <div className='mb-4 h-4  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10 rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <span className='sr-only'>Loading...</span>
        </div>
      )}

      {!isLoading && (
        <Fragment>
          <div className='relative mt-6 overflow-x-auto shadow-md sm:rounded-lg'>
            <table className='w-full text-left text-sm text-gray-500 dark:text-gray-400'>
              <thead className='bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400'>
                <tr>
                  <th scope='col' className='py-3 px-6'>
                    #
                  </th>
                  <th scope='col' className='py-3 px-6'>
                    Avatar
                  </th>
                  <th scope='col' className='py-3 px-6'>
                    Name
                  </th>
                  <th scope='col' className='py-3 px-6'>
                    Email
                  </th>
                  <th scope='col' className='py-3 px-6'>
                    <span className='sr-only'>Action</span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {data?.data
                  .sort((a, b) => {
                    const nameA = a.last_name.toUpperCase() // ignore upper and lowercase
                    const nameB = b.last_name.toUpperCase() // ignore upper and lowercase
                    const emailA = a.email.toUpperCase() // ignore upper and
                    const emailB = b.email.toUpperCase() // ignore upper and

                    if (nameA < nameB && emailA < emailB) {
                      return -1
                    }
                    if (nameA > nameB && emailA > emailB) {
                      return 1
                    }
                    // names must be equal
                    return 0
                  })
                  .map((student) => (
                    <tr
                      key={student.id}
                      className='border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600'
                      onMouseEnter={() => handlePrefetchStudent(student.id)}
                    >
                      <td className='py-4 px-6'>{student.id}</td>
                      <td className='py-4 px-6'>
                        <img src={student.avatar} alt='student' className='h-5 w-5' />
                      </td>
                      <th scope='row' className='whitespace-nowrap py-4 px-6 font-medium text-gray-900 dark:text-white'>
                        {student.last_name}
                      </th>
                      <td className='py-4 px-6'>{student.email}</td>
                      <td className='py-4 px-6 text-right'>
                        <Link
                          to={`/students/${student.id}`}
                          className='mr-5 font-medium text-blue-600 hover:underline dark:text-blue-500'
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className='font-medium text-red-600 dark:text-red-500'
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className='mt-6 flex justify-center'>
            <nav aria-label='Page navigation example'>
              <ul className='inline-flex -space-x-px'>
                <li>
                  {page === 1 ? (
                    <span className='cursor-not-allowed rounded-l-lg border border-gray-300 bg-white py-2 px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'>
                      Previous
                    </span>
                  ) : (
                    <Link
                      to={`/students?page=${page - 1}`}
                      className='rounded-l-lg border border-gray-300 bg-white py-2 px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                    >
                      Previous
                    </Link>
                  )}
                </li>
                {Array(totalPage)
                  .fill(0)
                  .map((_, index) => {
                    const pageNumber = index + 1
                    const isActive = page === pageNumber
                    return (
                      <li key={pageNumber}>
                        <Link
                          className={`${
                            isActive ? 'bg-gray-100 text-gray-700' : 'bg-white text-gray-500'
                          } border border-gray-300 py-2 px-3 leading-tight hover:bg-gray-100 hover:text-gray-700`}
                          to={`/students?page=${pageNumber}`}
                        >
                          {pageNumber}
                        </Link>
                      </li>
                    )
                  })}

                <li>
                  {page === totalPage ? (
                    <span className='rounded-r-lg border border-gray-300 bg-white py-2 px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'>
                      Next
                    </span>
                  ) : (
                    <Link
                      to={`/students?page=${page + 1}`}
                      className='rounded-r-lg border border-gray-300 bg-white py-2 px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                    >
                      Next
                    </Link>
                  )}
                </li>
              </ul>
            </nav>
          </div>
        </Fragment>
      )}
    </div>
  )
}
