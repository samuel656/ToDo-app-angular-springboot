import { Injectable } from '@angular/core';
import { Todo1 } from '../list-todos/list-todos';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TodoService {

  constructor(private http:HttpClient) { }

  getAllTodos(name:String): Observable<Todo1[]> {
    return this.http.get<Todo1[]>(`/api/users/${name}/list-todos`);
  }

  getTodoById(name:String,id:number){
    return this.http.get<Todo1>(`/api/users/${name}/list-todos/${id}`);
  }

  deleteTodo(username:string,id:number)
  {
      return this.http.delete(`/api/users/${username}/list-todos/${id}`)
  }

  updateTodo(username:string,id:number,todo:Todo1):Observable<any>
  {
    return this.http.put<any>(`/api/users/${username}/list-todos/${id}`,todo)
  }

  createTodo(username: string, todo: Todo1): Observable<any> {
  return this.http.post<any>(`/api/users/${username}/list-todos`, todo);
}

}
