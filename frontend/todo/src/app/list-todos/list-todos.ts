import { Component, OnInit } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { TodoService } from '../data/todo-service';
import { ActivatedRoute, Router } from '@angular/router';

export class Todo1{
  constructor(
    public id:number,
    public description: string,
    public done: boolean,
    public target: Date

  ){}
}

@Component({
  selector: 'app-list-todos',
  imports: [NgFor,DatePipe,NgIf],
  templateUrl: './list-todos.html',
  styleUrl: './list-todos.css'
})
export class ListTodos implements OnInit {
  username=''
  todos: Todo1[] = [];
  deleteMsg=''

// todos=[  
//   new Todo(1,'Learn AWS',false,new Date()),
//   new Todo(2,'Learn Azure',false,new Date()),
//   new Todo(3,'Learn Java FSD',false,new Date())
// ]


//   todos=[
//     { id:1,description:'Learn to Cook' },
//     { id:2,description:'Learn to dance'}
// ]

constructor(private todoService:TodoService,
  private router:Router,private route: ActivatedRoute)
{

}

  ngOnInit() {
    this.refreshTodos()
  }
  refreshTodos()
  {
    this.username = this.route.snapshot.params['username'];
    this.todoService.getAllTodos(this.username).subscribe(
    response=>this.todos=response
  ) 
  }

  deleteTodo(id: number) {
    console.log(`delete ${id}`)
    this.todoService.deleteTodo(this.username,id).subscribe(
      response=>{
        console.log(response)
        this.deleteMsg=`Delete Todo ${id} Successful`
        this.refreshTodos()
      }

    )
}
updateTodo(id: number) {
    this.router.navigate(['todos',this.username,id])
} 
createTodo() {
    this.router.navigate(['todos',this.username,-1])
}
}
