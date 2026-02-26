import { DatePipe, NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { SubTaskResponse } from '../../data/sub-task-response';
import { TodoItemRequest } from '../../data/todo-item-request';
import { TodoItemResponse } from '../../data/todo-item-response';
import { TodoUpdateRequest } from '../../data/todo-update-request';
import { UserResponse } from '../../data/user-response';
import { SubTaskService } from '../../services/sub-task.service';
import { TodoItemService } from '../../services/todo-item.service';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../util/notification.service';
import { EditSubTaskComponent } from "../edit-sub-task/edit-sub-task.component";
import { SubTaskComponent } from "../sub-task/sub-task.component";
import { TodoEditModalComponent } from "../todo-edit-modal/todo-edit-modal.component";

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [DatePipe, NgClass, ReactiveFormsModule, TodoEditModalComponent, SubTaskComponent, EditSubTaskComponent, NgIf],
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.css']
})
export class TodoItemComponent implements OnInit {

  @Input() itemsForView: TodoItemResponse[] = [];
  @Output() itemAdded = new EventEmitter<TodoItemResponse>();
  @Output() deleteItem = new EventEmitter<number>();


  addingItem = signal(false);
  addedItemResponse = signal<TodoItemResponse | null>(null);
  errorAddingItem = signal<string | null>(null);
  activeTodoForSubtask = signal<TodoItemResponse | null>(null);
  deleteSubTaskMessage = signal("");



  deletedItemMessage = "";
  errorDeletingItemMessage = "";
  todayDate!: string;
  addItemForm!: FormGroup;
  currentItem: TodoItemResponse | null = null;
  editingItem: TodoItemResponse | null = null;
  currentUser!: UserResponse;
  itemUser!: UserResponse;
  errorCompleting: { [todoId: string]: string } = {};
  userNameUserId: { [userId: string]: string } = {};


  constructor(private fb: FormBuilder,
    private ts: TodoItemService,
    private auth: AuthService, private us: UserService,
    private subService: SubTaskService,
    private ns: NotificationService) {
    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {

    this.addItemForm = this.fb.group(
      {
        title: ['', [Validators.required]],
        description: ['', [Validators.required]],
        dueDate: ['', [Validators.required]]
      }
    )
    this.getCurrentUser();
  }


  getCurrentUser() {
    const userId = this.auth.getUserId();
    if (userId) {
      this.us.getCurrentUser(userId).subscribe({
        next: (res) => this.currentUser = res as UserResponse,
        error: (err) => console.log(err)
      });
    }
  }

  // not completed, not closed
  get todoList(): TodoItemResponse[] {
    return this.itemsForView.filter(i => !i.completed && !i.closed);
  }

  // completed, but not closed
  get doneList(): TodoItemResponse[] {
    return this.itemsForView.filter(i => i.completed && !i.closed);
  }

  // closed (doesn't matter if completed or not)
  get closedList(): TodoItemResponse[] {
    return this.itemsForView.filter(i => i.closed);
  }


  addingTodoItem() {
    this.addingItem.set(true);
  }

  addingItemButtonCancel() {
    const ok = confirm("Are you sure you want to cancel?");

    if (ok) {
      this.addItemForm.reset();
      this.addingItem.set(false);
    }
  }

  deletingItemConfirmation(todoId: number) {
    const ok = confirm("Are you sure you want to delete this item?");

    if (ok) {
      this.deleteToDoItem(todoId)
      this.deleteItem.emit(todoId);
    }
  }
  submitItem() {
    if (this.addItemForm.invalid) {
      this.addItemForm.markAllAsTouched();
      return;
    }

    const formValue = this.addItemForm.value as TodoItemRequest;

    this.ts.addToDoItem(formValue).subscribe(
      {
        next: (res) => {
          this.addedItemResponse.set(res);
          //appears to top right away
          this.itemAdded.emit(res);
          // Reset the form
          this.addItemForm.reset();

          this.addingItem.set(false);

          this.errorAddingItem.set(null);

        },
        error: (err) => {
          this.errorAddingItem = err.error?.message || "Something went wrong while adding your item.";
        }
      });
  }

  deleteToDoItem(toDoId: number) {
    this.ts.deletedTodoItem(toDoId).subscribe({
      next: (res) => {
        this.deletedItemMessage = String(res),
          this.deleteItem.emit(toDoId);
      },
      error: () => {
        this.errorDeletingItemMessage = "Something went wrong while deleting your item.";
      }
    }

    );
  }

  confirmCompleteItem(item: TodoItemResponse) {

    const ok = confirm("Confirm to complete?");

    if (ok) {
      this.completeItem(item);
    }

  }
  //method to complete the item, Error if 1 ore more subtasked are not complete
  completeItem(item: TodoItemResponse) {

    const updateReq: TodoUpdateRequest = {
      id: item.todoId,
      title: item.title,
      description: item.description,
      dueDate: item.dueDate,
      completed: true
    }

    this.ts.updateTodoItem(updateReq).subscribe({
      next: (res) => {
        item.completed = true;
      },
      error: (err) => {
        if (err.status === 409) {
          this.errorCompleting[item.todoId] = "Cannot complete this item.Please make sure all sub - tasks are completed first.";
        } else {
          alert("Something went wrong while completing this item. Please try again.");
        }
      }
    })
  }

  editTodoItem(item: TodoItemResponse) {
    // keep a copy of the current item
    this.currentItem = { ...item };
    this.addingItem.set(true);

    this.addItemForm.patchValue({
      title: this.currentItem.title,
      description: this.currentItem.description,
      // ISO string. trim to yyyy-MM-dd for <input type="date">
      dueDate: this.currentItem.dueDate?.substring(0, 10) || ''
    });
  }

  openEdit(item: TodoItemResponse) {
    this.editingItem = item;
  }

  onEditClosed() {
    this.editingItem = null;
  }
  onItemUpdated(updated: TodoItemResponse) {
    const idx = this.itemsForView.findIndex(t => t.todoId === updated.todoId);
    if (idx !== -1) this.itemsForView[idx] = updated;

    this.editingItem = null;
  }

  //= Method to close Item for admin only

  closeTodoItem(todoId: number) {
    const ok = confirm("Confirm to close this item?");

    if (ok) {
      this.ts.closeTodoItem(todoId).subscribe({
        next: (res) => {
          const idx = this.itemsForView.findIndex(t => t.todoId === todoId);
          if (idx !== -1) this.itemsForView[idx] = res;
        }
      })
    }
  }

  //= Method to close Item for admin only

  reopenClosedTodoItem(todoId: number) {
    const ok = confirm("Confirm to reopen this item?");

    if (ok) {
      this.ts.openClosedTodoItem(todoId).subscribe({
        next: (res) => {
          const idx = this.itemsForView.findIndex(t => t.todoId === todoId);
          if (idx !== -1) this.itemsForView[idx] = res;
        }
      })
    }
  }


  //=============sCreate Subtask section down==================


  openSubTaskModal(todo: TodoItemResponse) {
    this.activeTodoForSubtask.set(todo);
  }

  handleSubTaskSaved(newSubTask: SubTaskResponse) {
    const current = this.activeTodoForSubtask();
    if (!current) return;
    // push into the correct todo's subTasks list
    current.subTasks.push(newSubTask);
    // optionally close modal
    this.activeTodoForSubtask.set(null);
  }

  handleSubTaskClosed() {
    this.activeTodoForSubtask.set(null)
  }

  //sub task mark it done
  markSubTaskDone(subTaskId: number) {
    const ok = confirm("Confirm to mark this sub-task as complete?");
    if (ok) {
      this.subService.closeSubTask(subTaskId).subscribe(
        {
          next: (res) => {
            const subTask = this.itemsForView.filter(a => a.subTasks)
              .flatMap(a => a.subTasks)
              .find(s => s.subTaskId === subTaskId);
            if (subTask) {
              subTask.completed = res.completed;
              subTask.updatedAt = res.updatedAt;
            }
          },
          error: (err) => {
            alert("Something went wrong while marking this sub-task as done.");
          }

        }
      )

    }
  }


  /* ======    Edit subtask =======*/
  // which subtask is currently being edited in a modal
  activeSubTaskForEdit = signal<SubTaskResponse | null>(null);

  /* ====== open edit-subtask modal ====== */
  openEditSubtaskModal(sub: SubTaskResponse) {

    this.activeSubTaskForEdit.set(sub);
  }

  /* ====== handle successful edit from modal ====== */
  handleEditSubTaskSaved(updated: SubTaskResponse) {
    const current = this.activeSubTaskForEdit();
    if (!current) {
      this.activeSubTaskForEdit.set(null);
      return;
    }

    // update the fields you care about on the original object
    current.description = updated.description;
    current.updatedAt = updated.updatedAt;

    // close modal
    this.activeSubTaskForEdit.set(null);
  }

  /* ====== handle cancel/close from modal ====== */
  handleEditSubTaskClosed() {
    this.activeSubTaskForEdit.set(null);
  }



  /* ======    delete subtask =======*/

  deleteSubTask(subTaskId: number) {
    const ok = confirm("Delete subtask?");
    if (!ok) return;

    this.subService.deleteSubtask(subTaskId).subscribe({
      next: (res) => {
        // res is "Subtask successfully deleted"
        this.deleteSubTaskMessage.set(res as string);
        // remove from UI
        this.itemsForView.forEach(todo => {
          if (todo.subTasks) {
            const idx = todo.subTasks.findIndex(s => s.subTaskId === subTaskId);
            if (idx !== -1) {
              todo.subTasks.splice(idx, 1);
            }
          }
        });


      },
      error: (err) => {
        console.error('Delete error:', err);
        alert("Something went wrong while deleting this sub-task.");
      }
    });
  }


  //=============label todo item for username =================
  //get Item UserId;

  getItemUseRByUserId(userId: string) {
    this.us.getUserById(userId).subscribe({
      next: (res) => {
        this.itemUser = res as UserResponse;
      }
    })
  }

  getUsernameByUserId(userId: string) {
    if (this.userNameUserId[userId]) {
      return this.userNameUserId[userId]; // return cached
    }
    this.us.getUserById(userId).subscribe({
      next: (res) => {
        const user = res as UserResponse;
        this.userNameUserId[userId] = user.username; // save to cache
      }
    });

    return ''; // temporary until async finishes
  }


}