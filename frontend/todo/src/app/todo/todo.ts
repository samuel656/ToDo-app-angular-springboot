import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TodoService } from '../data/todo-service';
import { Todo1 } from '../list-todos/list-todos';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgIf } from '@angular/common';
@Component({
  selector: 'app-todo',
  imports: [FormsModule,DatePipe,NgIf],
  standalone:true,
  templateUrl: './todo.html',
  styleUrl: './todo.css'
})
export class Todo implements OnInit{
  username=''
  id:number=-1
  todo!: Todo1; 
constructor(private activatedRoute:ActivatedRoute,
  private todoService:TodoService,private router:Router)
{

}

ngOnInit(){
  this.username = this.activatedRoute.snapshot.params['username'];  
  this.id=Number(this.activatedRoute.snapshot.params['id']);
  this.todo = new Todo1(0, '', false, new Date());
  if(this.id!==-1)
  {
    this.todoService.getTodoById(this.username,this.id).subscribe(data=>
    {
      this.todo=data
      
    })
  }

}


saveTodo() {
   this.todo.target = new Date(this.todo.target);
  this.username = this.activatedRoute.snapshot.params['username'];
  this.id = +this.activatedRoute.snapshot.params['id'];

  if (this.id === -1) {
    this.todoService.createTodo(this.username, this.todo).subscribe(
      data => {
        this.router.navigate(['todos', this.username]);
      }
    );
  } 

  else
  {
      this.todoService.updateTodo(this.username,this.id,this.todo).subscribe(
      response=>
      {
        console.log(response)
        this.router.navigate(['todos',this.username])
      }
  )
  }
  
}

}
